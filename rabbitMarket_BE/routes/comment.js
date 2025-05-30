const express = require('express');
const router = express.Router();
const Comments = require('../models/comment');
const authMiddleware = require('../middlewares/auth-middleware');

//댓글 작성
router.post('/comments', authMiddleware, async (req, res) => {
    let { user } = res.locals;
    const { comment, postId } = req.body;
    const comments = await new Comments({
        comment,
        nickname: user.nickname,
        postId,
        userId: user.userId,
    });
    try {
        const result = await comments.save();
        res.send({ ok: true, result });
    } catch (e) {
        console.log(e);
        res.send({
            ok: false,
            result: '댓글 작성에 실패했습니다',
        });
    }
});

//댓글 수정
router.patch('/comments', authMiddleware, async (req, res) => {
    let { user } = res.locals;
    const { commentId, comment } = req.body;

    try {
       const findCommentOwner = await Comments.findOne({
    _id: commentId,
    userId: user.userId,
});// 추가했음음

        if (findCommentOwner.userId === user.userId) {
            const result = await Comments.findByIdAndUpdate(
                { _id: commentId },
                { $set: { comment } },
                { new: true }
            ).exec();
            //const updatedComment = await result.save();
            return res.send({ ok: true, result });
        } else {
            res.status(400).json({ msg: '수정권한 없음' });
        }
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

//댓글 삭제
router.delete('/comments', authMiddleware, async (req, res) => {
    const { commentId } = req.body;
    try {
        const comment = await Comments.findByIdAndDelete(commentId);

        if (!comment) {
            return res.status(404).send({
                ok: false,
                result: '댓글 삭제에 실패했습니다',
            });
        }
        res.status(200).send({ ok: true, comment });
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});



module.exports = router;
