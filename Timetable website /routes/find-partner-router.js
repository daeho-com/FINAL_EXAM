// routes/find-partner-router.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/find-partner', async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    // 1) 내 설문
    const [[mySurvey]] = await pool.query(
      `SELECT smoking_status, meet_pref, study_goal, mbti
         FROM partner_survey
        WHERE user_id = ?`,
      [userId]
    );

    // 2) 동적 WHERE 절 준비
    const where = ['s1.user_id = ?'];
    const params = [userId];

    const { mbti, meet_pref, study_goal, smoking_status } = req.query;

    if (mbti) {
      where.push('u.mbti = ?');
      params.push(mbti);
    }
    if (meet_pref) {
      where.push('u.meet_pref = ?');
      params.push(meet_pref);
    }
    if (study_goal) {
      where.push('u.study_goal = ?');
      params.push(study_goal);
    }
    if (smoking_status) {
      where.push('u.smoking_status = ?');
      params.push(smoking_status);
    }

    // 3) 공강 겹침 쿼리 + HAVING
    const sql = `
      SELECT 
        s2.user_id,
        u.name, u.avatar_url, u.age, u.grade,
        u.department, u.university,
        COUNT(*) AS overlap_count
      FROM schedules s1
      JOIN schedules s2
        ON s1.day = s2.day
       AND s1.hour = s2.hour
       AND s1.user_id <> s2.user_id
      JOIN user_profile u
        ON u.user_id = s2.user_id
     WHERE ${where.join(' AND ')}
     GROUP BY s2.user_id
     HAVING overlap_count >= ?
     ORDER BY overlap_count DESC, u.user_id
    `;
    params.push(1); // 최소 겹침 개수

    const [users] = await pool.query(sql, params);

    res.render('filter', { users, mySurvey });
  } catch (err) {
    next(err);
  }
});

module.exports = router;