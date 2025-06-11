const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ■ 방 목록 조회 (GET /rooms)
router.get('/rooms', async (req, res, next) => {
  try {
    const [rooms] = await pool.query(
      `SELECT room_id, room_name, max_participants
         FROM video_rooms
       ORDER BY room_id DESC`
    );
    res.render('call-room_list', { rooms });
  } catch (e) { next(e) }
});

// ■ 새 방 생성 (POST /rooms)
router.post('/rooms', async (req, res, next) => {
  try {
    const { roomName, maxParticipants } = req.body;
    const roomId = 'room-' + Date.now();
    await pool.execute(
      `INSERT INTO video_rooms (room_id, room_name, max_participants)
       VALUES (?, ?, ?)`,
      [roomId, roomName, Number(maxParticipants)]
    );
    res.json({ success: true, room: { room_id: roomId, room_name: roomName, max_participants: maxParticipants } });
  } catch (e) {
    next(e);
  }
});

// ■ 화상통화 방 입장 페이지 (GET /video/:roomId)
router.get('/video/:roomId', (req, res) => {
  res.render('video-connection', { roomId: req.params.roomId });
});

module.exports = router;