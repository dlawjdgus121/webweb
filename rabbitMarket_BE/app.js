

require('dotenv').config();
const express = require('express');

const connect = require('./models');
const cors = require('cors');
const port = 3001;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const commentsRouter = require('./routes/comment');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const http = require('http');
const { Server } = require('socket.io');
const Chat = require('./models/chat'); // 경로 주의
const chatRouter = require('./routes/chat');
const server = http.createServer(app);
const ChatRoom = require('./models/ChatRoom'); // import 확인
const reportRouter = require('./routes/report'); // 경로는 상황에 맞게 조정

connect();

//body 읽기





const corsOptions = {
  origin: ['http://localhost:3000'], // 프론트 주소 명시
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use('api/report', reportRouter);

app.use('/api/chat', chatRouter);


// 여러  라우터를 사용할 경우 배열 형태로 배치
app.use(
    '/api',
    [postRouter, commentsRouter, userRouter, chatRouter] /* [goodRouter,userRouter] 이런식으로 쓸수도*/
);

app.get('/', async (req, res) => {
    //await user.create({ userId: 'test', password: 'test', nickname: 'test' });
    res.send('Hello World');
});
app.listen(port, () => {
    console.log('running on port', port);
});



const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ✅ 소켓 이벤트 처리
io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', async (data) => {
  try {
    // ✅ 구조분해로 값 꺼내기
    const {
      roomId,
      postId,
      postTitle,
      buyerNickname,
      sellerNickname,
      sender,
      message,
    } = data;

    if (!roomId || !sender) {
      throw new Error('roomId와 sender는 필수입니다.');
    }

    const chat = new Chat({
      roomId,
      sender,
      message,
      timestamp: new Date(),
    });

    await chat.save();

    await ChatRoom.findOneAndUpdate(
      { roomId },
      {
        $setOnInsert: {
          postId,
          postTitle,
          buyerNickname,
          sellerNickname,
        },
        $push: {
          messages: {
            sender,
            message,
            timestamp: new Date(),
          },
        },
        $set: {
          lastMessage: message,
          lastUpdated: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    io.to(roomId).emit('receive_message', data);
  } catch (err) {
    console.error('❌ 채팅 저장 실패:', err);
  }
});

});


// 4. REST API 서버 시작
app.listen(3003, () => {
  console.log('✅ REST API on port 3001');
});

// 5. Socket 서버 시작
server.listen(3002, () => {
  console.log('🚀 Socket.IO on port 3002');
});