

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
connect();

//body 읽기

const corsOptions = {
  origin: 'http://localhost:3000',  // 실제 프론트 주소로 변경하세요
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions))

// 여러  라우터를 사용할 경우 배열 형태로 배치
app.use(
    '/api',
    [postRouter, commentsRouter, userRouter] /* [goodRouter,userRouter] 이런식으로 쓸수도*/
);

app.get('/', async (req, res) => {
    //await user.create({ userId: 'test', password: 'test', nickname: 'test' });
    res.send('Hello World');
});
app.listen(port, () => {
    console.log('running on port', port);
});
