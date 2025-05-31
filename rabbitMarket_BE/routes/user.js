const express = require('express');
const Users = require('../models/user');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();
const bcrypt = require('bcrypt');
const sendVerificationEmail = require('../middlewares/nodemailer');
const crypto = require('crypto');
const Post = require('../models/post'); // 게시글 모델
const Comment = require('../models/comment'); // 댓글 모델 (있다면)

const ChatRoom = require('../models/ChatRoom');
const Chat = require('../models/chat');
/**
 * 회원가입 API.
 * 특정 pattern을 미리 정규표현식으로 정의하여, 변수로 선언해둔다.
 * postUserSchema 는 userId, nickname, password에 대해 Joi 라이브러리를 통해 조건을 명시함.
 */
const userId_pattern = /^[a-z|A-Z|0-9]+$/; // userId는 알파벳 대소문자 (a~z, A~Z), 숫자(0~9)로 구성
const nickname_pattern = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+$/; // 닉네임은 한글, 알파벳 대소문자 (a~z, A~Z), 숫자(0~9)로 구성
const postUserSchema = Joi.object({
    loginId: Joi.string().min(3).pattern(new RegExp(userId_pattern)).required(),
    password: Joi.string().min(4).required(),
    nickname: Joi.string().min(2).pattern(new RegExp(nickname_pattern)).required(),
});

router.post('/user/send-code', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@sungkyul.ac.kr')) {
    return res.status(400).json({ message: '올바른 이메일 형식이 아닙니다.' });
  }

  const code = crypto.randomInt(100000, 999999).toString();

  try {
    await sendVerificationEmail(email, code);
    res.status(200).json({ message: '인증코드 전송 완료', code }); // 실서비스 시 code 제거
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '이메일 전송 실패' });
  }
});


router.post('/signup', async (req, res) => {
    try {
        const { loginId, password, nickname } = await postUserSchema.validateAsync(req.body);
        if (password.includes(loginId)) {
            res.send({
                ok: false,
                result: '비밀번호에 사용자의 아이디는 포함할 수 없습니다.',
            });
            return;
        }
        const existUsers = await Users.find({
            $or: [{ userId: loginId }],
        });
        if (existUsers.length) {
            // userId 중복 데이터가 존재 할 경우
            res.send({
                ok: false,
                result: '중복된 ID입니다.',
            });
            return;
        }

        const user = new Users({ userId: loginId, password, nickname });
        await user.save();
        res.send({
            ok: true,
            result: '회원가입을 축하드립니다.',
        });
    } catch (err) {
        let validationErrorMessage = '';
        let JoiMessage = '';
        if (err.details) {
            JoiMessage = err.details[0].message; // Joi 에서 발생하는 오류 메시지.
        }
        if (JoiMessage.includes('loginId')) {
            if (JoiMessage.includes('at least 3')) {
                // 아이디가 3글자 미만인 경우
                // JoiMessage : "userId" length must be at least 3 characters long
                validationErrorMessage = '아이디는 3글자 이상이어야 합니다.';
            } else if (JoiMessage.includes('fails to match the required pattern')) {
                // 정규표현식 규칙에 맞지 않는 경우
                // JoiMessage : "userId" with value "나의아이디!" fails to match the required pattern: /^[a-z|A-Z|0-9]+$/
                validationErrorMessage = '아이디는 알파벳 대소문자, 숫자만 사용할 수 있습니다.';
            }
        } else if (JoiMessage.includes('password')) {
            // 비밀번호가 4글자 미만인 경우
            // JoiMessage: "password" length must be at least 4 characters long
            validationErrorMessage = '비밀번호는 4글자 이상이어야 합니다.';
        } else if (JoiMessage.includes('nickname')) {
            if (JoiMessage.includes('at least 2')) {
                // 닉네임이 2글자 미만인 경우
                // JoiMessage : "nickname" length must be at least 2 characters long
                validationErrorMessage = '닉네임은 2글자 이상이어야 합니다.';
            } else if (JoiMessage.includes('fails to match the required pattern')) {
                // 정규표현식 규칙에 맞지 않는 경우
                // JoiMessage : "nickname" with value "나의닉네임!" fails to match the required pattern: /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9]+$/
                validationErrorMessage = '닉네임은 한글, 알파벳, 숫자만 사용할 수 있습니다.';
            }
        } else {
            validationErrorMessage = '요청한 데이터 형식이 올바르지 않습니다.';
        }
        console.log(err);
        // console.log(err.details[0].message);
        res.send({
            ok: false,
            result: validationErrorMessage,
        });
    }
});

/**
 * 중복 아이디 체크 API
 * 입력받은 loginId 값으로 Users 스키마에 중복 아이디가 있는지 확인.
 */
router.post('/checkid', async (req, res) => {
    const { loginId } = req.body;
    const user = await Users.findOne({ userId: loginId }).exec();
    if (!user) {
        res.send({
            ok: true, // 사용가능한 아이디 입니다.
        });
    } else {
        res.send({
            ok: false, // 중복된 아이디가 있습니다.
        });
    }
});

/**
 * 로그인 API.
 * postLoginSchema 는 loginId, password에 대해 검사할 규칙을 사용.
 */
const postLoginSchema = Joi.object({
    loginId: Joi.string().required(),
    password: Joi.string().required(),
});
router.post('/login', async (req, res) => {
    try {
        const { loginId, password } = await postLoginSchema.validateAsync(req.body);
        const user = await Users.findOne({ userId: loginId }).exec();
        if (!user) {
            // request의 loginId 내용으로 일치하는 유저가 없는 경우
            res.send({
                ok: false,
                result: 'ID 또는 패스워드를 확인해주세요.',
            });
            return;
        }
        // 로그인 시 사용자로부터 입력받은 패스워드와 bcrypt를 거쳐 저장된 패스워드 비교
        const isSamePassword = await bcrypt.compare(password, user.password);
        if (!isSamePassword) {
            res.send({
                ok: false,
                result: 'ID 또는 패스워드를 확인해주세요.',
            });
            return;
        }
        const token = jwt.sign({ userId: user.userId }, '1234'); // 토큰을 서버쪽에서 sign 하여 생성
        res.send({
            token, // 토큰 전달
                nickname: user.nickname,  // 💥 여기에 닉네임을 같이 보내고 있음!

        });
    } catch (err) {
        res.send({
            ok: false,
            result: 'ID 또는 패스워드를 모두 입력해주세요.',
        });
    }
});

/**
 * 로그인 상태 체크 API.
 * 사용자 인증 미들웨어. 현재 로그인한 사용자를 jwt.verify 한 정보를 넘겨준다.
 */
router.get('/checklogin', authMiddleware, async (req, res) => {
    /**
     * res.locals 내용 예시
     * [Object: null prototpye] { user: { _id: new ObjectId("61e..81"), userId: 'test', password: '1234', nickname: 'mynickname', __v: 0 }}
     */
    const { user } = res.locals; // user object
    res.send({
        user: {
            userId: user.userId,
            nickname: user.nickname,
        },
    });
});


// ✅ 회원 탈퇴 API
router.delete('/user/withdraw', authMiddleware, async (req, res) => {
  try {
    const userId = res.locals.user.userId;
    const nickname = res.locals.user.nickname; // nickname이 roomId 조합 등에 사용됨

    // 1. 유저 삭제
    await Users.deleteOne({ userId });

    // 2. 유저 게시글, 댓글 삭제
    await Post.deleteMany({ userId });
    await Comment.deleteMany({ userId });

    // 3. [핵심!] 유저가 buyer/seller로 참여한 모든 채팅방 찾기
    const chatRooms = await ChatRoom.find({
      $or: [
        { buyerNickname: nickname },
        { sellerNickname: nickname }
      ]
    });

    // 4. 각 채팅방(roomId)마다 모든 메시지 삭제
    for (const room of chatRooms) {
      await Chat.deleteMany({ roomId: room.roomId });
    }

    // 5. 채팅방 자체도 삭제
    await ChatRoom.deleteMany({
      $or: [
        { buyerNickname: nickname },
        { sellerNickname: nickname }
      ]
    });

    res.json({ msg: '회원 탈퇴 및 관련 데이터 모두 삭제 완료!' });
  } catch (err) {
    console.error('❌ 탈퇴 실패:', err);
    res.status(500).json({ msg: '서버 오류' });
  }
});



module.exports = router;
