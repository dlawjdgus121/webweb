const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts', required: true },
  createdAt: { type: Date, default: Date.now },
});

// 유저-게시물 중복 찜 방지 위해 인덱스 추가
wishlistSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
