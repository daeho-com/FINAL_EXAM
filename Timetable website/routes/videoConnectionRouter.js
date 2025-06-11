// routes/videoConnectionRouter.js
const express = require('express');
const pool    = require('../db');       // DB 풀
const router  = express.Router();

router.get('/video/:roomId', async (req, res, next) => {
  try {
    const roomId = req.params.roomId;
    // ① DB에서 room_name 꺼내기
    const [rows] = await pool.query(
      `SELECT room_name, max_participants 
         FROM video_rooms 
        WHERE room_id = ?`, 
      [roomId]
    );
    if (!rows.length) {
      // 없는 방이면 목록으로
      return res.redirect('/rooms');
    }
    const { room_name, max_participants } = rows[0];

    // ② 뷰에 ID뿐 아니라 title(이름)도 함께 넘기기
    res.render('video-connection', {
      roomId,             // 기존 ID
      roomName: room_name // DB에서 조회한 제목
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;