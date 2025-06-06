require('dotenv').config();
// 1. 필요한 모듈 불러오기
const express = require('express');
// app.js (또는 파일업로드 미들용 모듈)
const multer = require('multer');
const path = require('path');
const session = require('express-session'); 
const app = express();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const partnerSurveyRouter = require('./routes/partner-survey-route');


const transporter = nodemailer.createTransport({
  host: 'smtp.naver.com', // Office 365 SMTP 서버
  port: 465,                  // STARTTLS 포트
  secure: true,              // false → STARTTLS 사용
  auth: {
    user: 'younyenho@naver.com',      // 발송용으로 생성한 서비스 계정 이메일
    pass: 'WN8KC23E9R6V'
  }
});

// ← 이 한 줄로 db.js 에 있는 pool 을 불러옵니다
const pool = require('./db');

// 업로드 디렉토리와 저장 방식 설정
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads'));  
  },
  filename(req, file, cb) {
    // 예: user-<userId>-<timestamp>.jpg
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.session.userId}-${Date.now()}${ext}`);
  }
});

// 파일 필터: .jpg만 허용
function fileFilter(req, file, cb) {
  if (file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(new Error('이미지는 .jpg만 업로드 가능합니다.'), false);
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
// 3) 업로드된 파일을 정적 제공하도록
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// 세션 설정 (cookie 기반)
app.use(session({
  secret: 'YOUR_SECRET_KEY',    // 실제 배포 시에는 안전한 문자열로 바꿔주세요
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }     // https가 아니면 false
}));

// 2. 미들웨어 설정
app.use(express.urlencoded({ extended: true })); // form 데이터 파싱
app.use(express.json());                         // JSON 데이터 파싱
app.use(express.static(path.join(__dirname, 'public')));  // public 폴더 정적 파일 제공
app.use(
  '/components',
    express.static(path.join(__dirname,'components'))
  ); // components 폴더 정적 파일 제공
// EJS 뷰 엔진 설정 추가
app.set('view engine', 'ejs'); // EJS 템플릿 엔진 사용
app.set('views', path.join(__dirname, 'views')); // views 폴더 설정
app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  next();
});


// 3. 기본 라우팅 (index.html 보여주기)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/timetable', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.render('timetable');
});


app.get('/mbti', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.render('mbti');
});

app.get('/input01', (req, res) => {
  res.render('age_grade_id');
});

app.get('/input02', (req, res) => {
  res.render('input02');
});

app.get('/input03', (req, res) => {
  res.render('input03');
});

app.get('/first-page', (req, res) => {
  res.render('firstpage');
});


app.get('/certification-stage', (req, res) => {
  const data = req.session.signupData;
   if (!data) {
     // 1단계(가입 폼)를 거치지 않고 바로 왔으면
     return res.redirect('/create_account');
   }
  res.render('certification-stage', { data });
});

app.get('/create_account', (req, res) => {
  res.render('create_account');
});

// 공강 겹치는 유저 리스트업 (ejs 렌더링용)
app.get('/find-partner', async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    // 1) 내 설문 조회
    const [[mySurvey]] = await pool.query(
      `SELECT smoking_status, meet_pref, study_goal, mbti
          FROM partner_survey
        WHERE user_id = ?`,
      [userId]
    );

    const minOverlap = 1; // 기본 1개 이상 겹치면 보여줌
    const [rows] = await pool.query(
      `SELECT 
         s2.user_id,
         u.name,
         u.avatar_url,
         u.age,
         u.grade,
         u.department,
         u.university,
         COUNT(*) AS overlap_count
       FROM schedules s1
       JOIN schedules s2
         ON s1.day = s2.day AND s1.hour = s2.hour AND s1.user_id <> s2.user_id
       JOIN user_profile u ON u.user_id = s2.user_id
      WHERE s1.user_id = ?
      GROUP BY s2.user_id
      HAVING overlap_count >= ?
      ORDER BY overlap_count DESC, u.user_id
      `,
      [userId, minOverlap]
    );

    res.render('find-partner', { users: rows, mySurvey });
  } catch (err) {
    next(err);
  }
});

app.get('/users/:id', async (req, res, next) => {
  try {
    // 🔴 로그인 여부 확인
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    const userId = parseInt(req.params.id, 10);

    // 1) 상대방 유저 프로필 조회
    const [userRows] = await pool.query(
      `SELECT user_id, name, avatar_url, university, department, grade, age,
              mbti, gender, meet_pref, study_goal,
              vibe_pref, speaking_style, noise_sensitivity,
              charm_point, strength
        FROM user_profile
        WHERE user_id = ?`,
      [userId]
    );
    if (!userRows[0]) return res.status(404).send('User not found');
    const user = userRows[0];

    // 2) 로그인한 유저, 상대방 유저의 스케줄 조회
    const currentUserId = req.session.userId;
    const [mine] = await pool.query(
      `SELECT day, hour FROM schedules WHERE user_id = ?`,
      [currentUserId]
    );
    const [other] = await pool.query(
      `SELECT day, hour FROM schedules WHERE user_id = ?`,
      [userId]
    );

    // 3) 공강시간 매칭 계산 (첫 번째 코드의 정확한 로직!)
    const mineBusySet = new Set(mine.map(r => `${r.day}-${r.hour}`));
    const otherBusySet = new Set(other.map(r => `${r.day}-${r.hour}`));
    const matchSlots = [];
    for (let day = 1; day <= 5; day++) {
      for (let hour = 10; hour <= 18; hour++) {
        const key = `${day}-${hour}`;
        // 두 사람 모두 해당 시간에 수업이 없는 경우
        const isFreeForMe = !mineBusySet.has(key);
        const isFreeForOther = !otherBusySet.has(key);
        const isMatch = isFreeForMe && isFreeForOther;
        matchSlots.push({ day, hour, match: isMatch });
      }
    }

    // 4) EJS 렌더링
    res.render('user-detail', { user, matchSlots, currentUserId });

  } catch (err) {
    next(err);
  }
});


// app.js
app.get('/letters', async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    // 받은 편지 (모든 상태)
    const [inbox] = await pool.query(`
      SELECT l.id, u.user_id AS peerId, u.name, u.avatar_url, l.status
      FROM letters l
      JOIN user_profile u ON u.user_id = l.sender_id
      WHERE l.receiver_id = ?
      ORDER BY l.sent_at DESC
    `, [userId]);

    // 보낸 편지 (모든 상태)
    const [sent] = await pool.query(`
      SELECT l.id, u.user_id AS peerId, u.name, u.avatar_url, l.status
      FROM letters l
      JOIN user_profile u ON u.user_id = l.receiver_id
      WHERE l.sender_id = ?
      ORDER BY l.sent_at DESC
    `, [userId]);

    res.render('letters-list', { inbox, sent });
  } catch (err) {
    next(err);
  }
});


  // ■ 편지 상세보기 라우트
  app.get('/letters/:letterId', async (req, res, next) => {
    try {
      const letterId = req.params.letterId;
      const [rows] = await pool.query(`
        SELECT l.*, u.name, u.avatar_url, u.kakao_id, l.receiver_id
        FROM letters l
        JOIN user_profile u
          ON u.user_id = l.sender_id
        WHERE l.id = ?
      `, [letterId]);
      if (!rows[0]) return res.status(404).send('No such letter');
      const letter = rows[0];
      // 세션에서 로그인한 유저 ID
      const currentUserId = req.session.userId;
      res.render('letters-detail', { letter, currentUserId });
    } catch (err) {
      next(err);
    }
  });

  app.post('/certification-stage', async (req, res) => {
    const {
      action,
      name, university, email, gender, department,
      code, password
    } = req.body;
  
    // 공통으로 넘겨줄 기본 로컬 변수
    const baseLocals = {
      data: req.session.signupData || { name, university, email, gender, department },
      codeVerified: false,
      signupComplete: false,
      mailSent: false,
      error: null
    };
  
    // 1) “인증번호 보내기” 클릭 (action=verify, 최초)
    if (action === 'verify' && !req.session.emailCode) {
      // a) 세션에 코드 저장
      const emailCode = String(100000 + Math.floor(Math.random() * 900000));
      req.session.emailCode = emailCode;
      req.session.signupData = { name, university, email, gender, department };
  
      // b) 메일 발송
      await transporter.sendMail({
        from:    `"GBC 인증" <${transporter.options.auth.user}>`,
        to:      email,
        subject: 'GBC 회원가입 인증번호',
        text:    `안녕하세요!\n인증번호는 ${emailCode} 입니다.`
      });
  
      return res.render('certification-stage', {
          ...baseLocals,
          // 기존 signupData에 code 세션 값을 추가
          data: {
            ...baseLocals.data,
            code: req.session.emailCode
          },
          mailSent: true
        });
    }
  
    // 2) “인증하기” 클릭 (action=verify, 세션에 emailCode 있음)
    if (action === 'verify' && req.session.emailCode) {
      if (code === req.session.emailCode) {
        // 검증 성공 → codeVerified=true
          return res.render('certification-stage', {
              ...baseLocals,
              data: {
                ...baseLocals.data,
                code: req.session.emailCode
              },
              mailSent: true,
              codeVerified: true
            });
      } else {
            // 검증 실패 → error 메시지, codeVerified는 false로
            return res.render('certification-stage', {
              ...baseLocals,
              data: {
                ...baseLocals.data,
                code: req.session.emailCode
              },
              mailSent: true,
              codeVerified: false,          // ← false로 변경
              error: '인증번호가 일치하지 않습니다.'
            });
      }
    }
  
    // 3) “회원가입 완료” 클릭 (action=complete)
    if (action === 'complete') {
      if (req.session.emailCode !== code) {
        // 코드 불일치
        return res.render('certification-stage', {
          ...baseLocals,
          mailSent: true,
          error: '인증번호가 일치하지 않습니다.'
        });
      }
      // 코드 일치 → DB 저장 후 signupComplete=true
      const hash = await bcrypt.hash(password, 10);
      await pool.execute(
        `INSERT INTO user_profile
           (name, university, email, password, gender, department)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, university, email, hash, gender, department]
      );
      return res.render('certification-stage', {
          ...baseLocals,
          data: {
            ...baseLocals.data,
            code: req.session.emailCode
          },
          codeVerified: true,
          signupComplete: true
        });
    }
  
    // 그 외 잘못된 접근은 다시 1단계로
    res.redirect('/create_account');
  });
    
    
  app.post('/login', async (req, res) => {
  try {
    const { 'login-email': email, 'login-password': password } = req.body;

    const [rows] = await pool.query(
      `SELECT user_id, password
         FROM user_profile
        WHERE email = ?`,
      [email]
    );

    if (!rows[0]) {
      return res.render('login', { error: '등록된 이메일이 아닙니다.' });
    }

    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      return res.render('login', { error: '비밀번호가 일치하지 않습니다.' });
    }

    const userId = rows[0].user_id;
    req.session.userId = userId;

    // ✅ 로그인 후 단계별 체크
    // 1️⃣ 스케줄 확인
    const [schedules] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM schedules WHERE user_id = ?`,
      [userId]
    );
    if (!schedules[0].cnt) {
      return res.redirect('/timetable');
    }

    // 2️⃣ MBTI 확인
    const [[user]] = await pool.query(
      `SELECT mbti, age, grade, kakao_id, smoking_status, meet_pref, 
              study_goal, vibe_pref,
              speaking_style, noise_sensitivity, charm_point, strength
         FROM user_profile WHERE user_id = ?`,
      [userId]
    );
    if (!user.mbti) {
      return res.redirect('/mbti');
    }

    // 3️⃣ input01 데이터 확인
    if (!(user.age && user.grade && user.kakao_id && user.smoking_status && user.meet_pref)) {
      return res.redirect('/input01');
    }

    // 4️⃣ input02 데이터 확인
    if (!(user.study_goal && user.vibe_pref)) {
      return res.redirect('/input02');
    }

    // 5️⃣ input03 데이터 확인
    if (!(user.speaking_style && user.noise_sensitivity && user.charm_point && user.strength)) {
      return res.redirect('/input03');
    }

    // 6️⃣ 모든 정보가 있으면 내 프로필 페이지로
    return res.redirect(`/users/${userId}`);
  } catch (err) {
    console.error(err);
    return res.status(500).render('login', { error: '서버 오류가 발생했습니다.' });
  }
});

  

// ■ ② POST /timetable — 저장 후 MBTI 페이지로 이동
app.post('/timetable', async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    // 클라이언트에서 "slots" 이름으로 comma-separated string 전송 가정
    const raw = req.body.slots || '';
    const slots = raw.split(',').filter(s => s);

    // 기존 스케줄 삭제
    await pool.execute(`DELETE FROM schedules WHERE user_id = ?`, [userId]);

    // 새로 삽입
    await Promise.all(
      slots.map(slot => {
        const [day, hour] = slot.split('-').map(Number);
        return pool.execute(
          `INSERT INTO schedules (user_id, day, hour) VALUES (?, ?, ?)`,
          [userId, day, hour]
        );
      })
    );

    return res.redirect('/mbti');
  } catch (err) {
    next(err);
  }
});

// ③ POST /mbti — MBTI 저장하고 다음 페이지(나이/학년/ID)로 이동
app.post('/mbti', async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { mbti } = req.body;
    if (!userId) return res.redirect('/login');
    if (!mbti)  return res.redirect('/mbti');

    // user_profile 테이블의 mbti 컬럼에 저장
    await pool.execute(
      `UPDATE user_profile
         SET mbti = ?
       WHERE user_id = ?`,
      [mbti, userId]
    );

    // 다음 단계로
    res.redirect('/input01');
  } catch (err) {
    next(err);
  }
});

app.post('/input01',upload.single('avatar'), async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    const { age, grade, kakaoId, smokingStatus, meetPref } = req.body;
    // 업로드된 파일이 있으면 URL, 없으면 기본 이미지
    let avatarUrl = '/img/profile.jpg';
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    }
    // ① user_profile 업데이트
    await pool.execute(
      `UPDATE user_profile
         SET age = ?, grade = ?, kakao_id = ?, smoking_status = ?, meet_pref = ?, avatar_url     = ?
       WHERE user_id = ?`,
      [age, grade, kakaoId, smokingStatus, meetPref, avatarUrl, userId]
    );

    // ② 다음 페이지로 리다이렉트 (ex: MBTI 페이지)
    res.redirect('/input02');
  } catch (err) {
    next(err);
  }
});

// ■ ③ POST /input02 — 저장 후 다음 페이지로 리다이렉트
app.post('/input02', async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    const { study_goal, vibe_pref } = req.body;
    // ① user_profile 에 업데이트
    await pool.execute(
      `UPDATE user_profile
         SET study_goal = ?, vibe_pref = ?
       WHERE user_id = ?`,
      [study_goal, vibe_pref, userId]
    );

    // ② 다음 단계로 이동 (예: 스타일 설정 페이지)
    return res.redirect('/input03');
  } catch (err) {
    next(err);
  }
});

// ■ ④ POST /input03 — 스타일 환경설정 저장 후 다음 페이지로
app.post('/input03', async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    const { speaking_style, noise_sensitivity, charm_point, strength } = req.body;

    // user_profile 테이블에 업데이트
    await pool.execute(
      `UPDATE user_profile
         SET speaking_style = ?, noise_sensitivity = ?, charm_point = ?, strength = ?
       WHERE user_id = ?`,
      [speaking_style, noise_sensitivity, charm_point, strength, userId]
    );

    // 저장 완료 후, 원하시는 페이지로 리다이렉트
    return res.redirect('/partner-survey'); // 예: 메인 페이지나 편지 리스트 등
  } catch (err) {
    next(err);
  }
});

app.post('/letter-list', async (req, res, next) => {
  try {
    console.log('→ letter-list POST body:', req.body);
    console.log('→ 세션 userId:', req.session.userId);
    const senderId   = req.session.userId;
    const receiverId = Number(req.body.receiver_id);
    if (!senderId || senderId === receiverId) {
      // 로그인 안 됐거나, 자기 자신에게 보내려 하면
      return res.redirect('/letters');
    }

    // content 컬럼에 기본 메시지나 빈 문자열 넣기
    const content = '';

    // 중복 키(UK on sender_id+receiver_id)가 있으면 무시
    await pool.execute(
      `INSERT IGNORE INTO letters (sender_id, receiver_id, content)
       VALUES (?, ?, ?)`,
      [senderId, receiverId, content]
    );

    // 항상 받은 편지함으로 돌아가기
    res.redirect('/letters');
  } catch (err) {
    next(err);
  }
});


    // 유저 정보 저장 API (POST)
    app.post('/api/user-info', async (req, res) => {
      try {
        const {
          age, grade, kakaoId,
          smokingStatus, meetingPref,
          // … 나중에 mbti, gender 등도 추가 가능
        } = req.body;
    
        const sql = `
          INSERT INTO user_info
            (age, grade, kakao_id, smoking_status, meeting_pref)
          VALUES
            (?, ?, ?, ?, ?)
        `;
        const params = [age, grade, kakaoId, smokingStatus, meetingPref];
        const [result] = await pool.query(sql, params);
    
        res.json({ success: true, insertId: result.insertId });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
      }
   });

  // ■ 편지 수락/거절 API
  app.post('/api/letters/:letterId/:action', async (req, res) => {
    try {
      const { letterId, action } = req.params;
      if (!['accept','reject'].includes(action)) {
        return res.status(400).json({ success:false, error:'INVALID_ACTION' });
      }
      const newStatus = action==='accept' ? 'accepted' : 'rejected';
      await pool.query(
        `UPDATE letters SET status = ? WHERE id = ?`,
        [newStatus, letterId]
      );
      res.json({ success:true, status:newStatus });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success:false, error:'SERVER_ERROR' });
    }
  });


app.use('/partner-survey', partnerSurveyRouter);
const findPartnerRouter = require('./routes/find-partner-router');
app.use('/', findPartnerRouter);

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).send('로그아웃 중 오류 발생!');
    }
    res.redirect('/login'); // 로그아웃 후 로그인 페이지로 리다이렉트
  });
});

// 4. 서버 시작
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});