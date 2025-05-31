// routes/chat.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const ChatRoom = require('../models/ChatRoom'); // 채팅방 모델

router.get('/chatrooms/:nickname', async (req, res) => {
  const nickname = req.params.nickname;

  try {
    const rooms = await ChatRoom.find({
      $or: [
        { buyerNickname: nickname },
        { sellerNickname: nickname }
      ]
    }).sort({ lastUpdated: -1 });

    res.json({ ok: true, rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'DB 조회 오류' });
  }
});

// ✅ roomId로 조회하도록 고침
router.get('/:roomId', async (req, res) => {
  try {
    const chats = await Chat.find({ roomId: req.params.roomId }).sort('timestamp');
    res.status(200).json({ chats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '채팅 내역 조회 실패' });
  }
});




module.exports = router;
