
// middleware/nodemailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendVerificationEmail = async (toEmail, code) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,         // 발신자 이메일
      pass: process.env.APP_PASSWORD,  // 앱 비밀번호
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: toEmail,
    subject: '성결대학교 인증 코드',
    text: `인증 코드: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`이메일 전송 성공: ${toEmail}`);
  } catch (error) {
    console.error('이메일 전송 실패:', error);
    throw error;
  }
};

module.exports = sendVerificationEmail;