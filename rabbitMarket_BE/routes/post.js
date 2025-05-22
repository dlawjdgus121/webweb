const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Comment = require('../models/comment');
const authMiddleware = require('../middlewares/auth-middleware');
const { upload } = require('./upload');

//전체 상품 조회
router.get('/posts', async (req, res) => {
    let posts = await Post.find({});
    posts.sort(function (a, b) {
        return b.updatedAt - a.updatedAt;
    });
    for (let i = 0; i < posts.length; i++) {
        const comments_cnt = await Comment.count({ postId: posts[i]._id });
        posts[i]._doc.comments_cnt = comments_cnt;
          posts[i]._doc.postId = posts[i]._id; 
    }
    //console.log(posts);
    res.json({ ok: true, posts });
});

// 상품 제목으로 검색 결과 조회
router.get('/search', async (req, res) => {
    let { title } = req.query;
    const regex = (pattern) => new RegExp(`.*${pattern}.*`);
    const titleRegex = regex(title);

    let posts = await Post.find({ title: { $regex: titleRegex } });

    posts.sort(function (a, b) {
        return b.updatedAt - a.updatedAt;
    });
    for (let i = 0; i < posts.length; i++) {
        const comments_cnt = await Comment.count({ postId: posts[i]._id });
        posts[i]._doc.comments_cnt = comments_cnt;
    }
    //console.log(posts);
    res.json({ ok: true, posts });
});

//상세 상품 조회
router.get('/posts/:postId', async function (req, res) {
    const { postId } = req.params;
    Post.findById(postId, async function (err, post) {
        if (!err) {
            let comments = await Comment.find({ postId: postId });
            comments.sort(function (a, b) {
                return b.updatedAt - a.updatedAt;
            });
            res.json({ ok: true, post, comments });
        } else {
            res.json({ ok: false, post: {}, comments: {} });
        }
    });
});

//image upload to s3 사진 1개씩 저장,

router.post('/image', upload.single('imgUrl'), async (req, res) => {
     console.log('파일 정보:', req.file);
    const file = await req.file;
    //console.log(file);
    try {
        const result = await file.location;
        //console.log(result);
        //사진경로가있는 주소를  imgurl이라는 이름으로 저장
        res.status(200).json({ imgurl: result });
    } catch (e) {
        console.error('이미지 업로드 실패:', e);
        return res.status(500).json({ ok: false, message: '이미지 업로드 실패' });
    }
});
//판매 상품 등록
router.post('/posts', authMiddleware, async function (req, res) {
      console.log("받은 데이터:", req.body);
    try {
        console.log('요청 바디:', req.body);
        const { title, price, imgurl, content } = req.body;
        
        let { user } = res.locals;

        if (title && content && price && imgurl) {
            await Post.create({
                title,
                content,
                price,  
                imgurl,
                isSold: false,
                userId: user.userId,
                nickname: user.nickname,
            });
            return res.json({ ok: true, result: '판매 상품이 등록되었습니다.' });
        } else {
            return res.status(400).json({ ok: false, result: '올바른 입력이 아닙니다.' });
        }
    } catch (error) {
        console.error('게시물 등록 중 오류:', error);
        return res.status(500).json({ ok: false, result: '서버 오류가 발생했습니다.' });
    }
});

//판매 상품 수정
router.put('/posts', authMiddleware, async function (req, res) {
    const { title, price, imgurl, content, postId } = req.body;
    let { user } = res.locals;

    //price number? string? 자동 변환 되는지
    if (title != '' && content != '' && price != '' && imgurl != '') {
        const existsPost = await Post.findById(postId);
        if (user.userId === existsPost.userId) {
            await Post.updateOne(
                { _id: postId },
                {
                    $set: {
                        title,
                        content,
                        price,
                        imgurl,
                        isSold: false,
                        userId: user.userId,
                        nickname: user.nickname,
                    },
                }
            );
            return res.json({ ok: true, result: '판매 상품이 수정되었습니다.' });
        } else return res.json({ ok: false, result: '수정 권한이 없습니다.' });
    } else {
        return res.json({ ok: false, result: '올바른 입력이 아닙니다.' });
    }
});

//판매 상품 삭제
router.delete('/posts', authMiddleware, async (req, res) => {
    const { postId } = req.body;
    const existsPost = await Post.findById(postId);
    const { user } = res.locals;

    if (existsPost.userId === user.userId) {
        await Post.deleteOne({ _id: postId });
        return res.json({ ok: true, result: '판매 상품이 삭제되었습니다.' });
    }

    return res.json({ ok: false, result: '삭제 권한이 없습니다.' });
});

//판매중-판매완료 상태수정
router.patch('/status', authMiddleware, async function (req, res) {
    const { postId } = req.body;
    let { user } = res.locals;

    let post = await Post.findById(postId);
    if (post.userId === user.userId) {
        await Post.updateOne(
            { _id: postId },
            {
                $set: {
                    isSold: !post.isSold,
                },
            }
        );
        if (!post.isSold) {
            return res.json({ ok: true, result: '판매완료로 변경 되었습니다.' });
        } else {
            return res.json({ ok: true, result: '판매중으로 변경 되었습니다.' });
        }
    } else {
        return res.json({ ok: false, result: '권한이 없습니다.' });
    }
});

// 판매중/판매완료 따라 분류
router.get('/sales', async (req, res) => {
    const { isSold } = req.query;
    if (!isSold) {
        return res.json({ ok: false, posts: {} });
    }

    let posts = await Post.find({ isSold: isSold });
    posts.sort(function (a, b) {
        return b.updatedAt - a.updatedAt;
    });
    for (let i = 0; i < posts.length; i++) {
        const comments_cnt = await Comment.count({ postId: posts[i]._id });
        posts[i]._doc.comments_cnt = comments_cnt;
    }
    return res.json({ ok: true, posts });
});


module.exports = router;
