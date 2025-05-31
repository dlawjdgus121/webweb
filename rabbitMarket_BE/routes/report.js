const express = require('express');
const router = express.Router();
const Report = require('../models/report');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = res.locals.user._id; // 인증된 유저의 _id
  console.log('req.body:', req.body);

console.log('reportPost 호출', postId, content );
  try {
    // 중복 신고 확인
    const existingReport = await Report.findOne({ postId, userId });
            console.log('existingReport:', existingReport);

    if (existingReport) {
      return res.status(400).json({ message: '이미 이 게시물에 대해 신고하셨습니다.' });
    }

    await Report.create({ postId, userId, content });

    const reportCount = await Report.countDocuments({ postId });

    let warningMessage = null;
    if (reportCount >= 3) {
      warningMessage = `⚠️ 해당 게시글은 현재 ${reportCount}건의 신고가 접수되었습니다.`;
    }

    res.status(200).json({
      message: '신고 완료',
      reportCount,
      warningMessage,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '신고 저장 실패' });
  }
});

module.exports = router;
