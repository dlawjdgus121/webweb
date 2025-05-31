const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const authMiddleware = require('../middlewares/auth-middleware'); // 로그인 검증 미들웨어

// 찜 추가
router.post('/:postId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id; // authMiddleware에서 user 정보 넣어준다고 가정
    const postId = req.params.postId;

    // 찜 중복 체크 후 추가
    const exist = await Wishlist.findOne({ userId, postId });
    if (exist) {
      return res.status(400).json({ message: '이미 찜한 게시물입니다.' });
    }

    const wishlist = new Wishlist({ userId, postId });
    await wishlist.save();

    res.status(201).json({ message: '찜 추가 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 찜 삭제
router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;

    await Wishlist.deleteOne({ userId, postId });

    res.status(200).json({ message: '찜 삭제 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 내 찜 목록 조회
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // postId를 populate해서 게시물 정보 전체를 가져오기
    const wishlistItems = await Wishlist.find({ userId }).populate('postId');

    const wishlist = wishlistItems.map(item => ({
      _id: item.postId._id,
      title: item.postId.title,
      description: item.postId.description,
      imgurl: item.postId.imgurl,  // 이미지 URL
      price: item.postId.price,
      // 필요하면 추가 필드도 넣기 가능 (예: status, category 등)
    }));

    res.status(200).json({ wishlist });
  } catch (err) {
    console.error('Wishlist 조회 중 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

router.get('/check/:postId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;

    const exist = await Wishlist.findOne({ userId, postId });
    if (exist) {
      return res.status(200).json({ isWishlisted: true });
    } else {
      return res.status(200).json({ isWishlisted: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;
