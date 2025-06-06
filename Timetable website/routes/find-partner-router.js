// routes/find-partner-router.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/find-partner', async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    // 1) 내 설문 조회 (partner_survey 테이블)
    const [rows] = await pool.query(
      `SELECT smoking_status, meet_pref, study_goal, mbti
         FROM partner_survey
        WHERE user_id = ?`,
      [userId]
    );
    // rows가 [] 이면 mySurveyRows[0]이 undefined가 되므로
    // 기본값 객체를 만들어 준다.
    const mySurvey = rows[0] || {
      smoking_status: null,
      meet_pref:      null,
      study_goal:     null,
      mbti:           null
    };

    // 2) 공강 겹침 + 필터링 쿼리
    const [users] = await pool.query(
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
         ON s1.day = s2.day 
        AND s1.hour = s2.hour 
        AND s1.user_id <> s2.user_id
       JOIN user_profile u ON u.user_id = s2.user_id
      WHERE s1.user_id = ?
        AND (   (? IS NULL OR u.mbti          = ?)
             AND (? IS NULL OR u.meet_pref     = ?)
             AND (? IS NULL OR u.study_goal    = ?)
             AND (? IS NULL OR u.smoking_status= ?)
            )
      GROUP BY s2.user_id
      HAVING overlap_count >= 1
      ORDER BY overlap_count DESC, u.user_id`,
      [
        userId,
        req.query.mbti    || null, req.query.mbti    || null,
        req.query.meet_pref || null, req.query.meet_pref || null,
        req.query.study_goal|| null, req.query.study_goal|| null,
        req.query.smoking_status || null, req.query.smoking_status || null
      ]
    );

    // 3) EJS 템플릿으로 mySurvey, users, query 전달
    res.render('find-partner', {
      mySurvey,
      users,
      query: req.query,
      showLettersLink : true
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;