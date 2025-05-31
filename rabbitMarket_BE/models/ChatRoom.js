// /models/ChatRoom.js
const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
  roomId: String,
  postId: String,
  postTitle: String,
  buyerNickname: String,
  sellerNickname: String,
  messages: [
    {
      sender: String,
      message: String,
      timestamp: Date
    }
  ],
  lastMessage: String,
  lastUpdated: Date
});

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);
