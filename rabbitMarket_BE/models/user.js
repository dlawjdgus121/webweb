const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        nickname: {
            type: String,
            required: true,
        },
    },
    { timestamps: true } // createdAt, updatedAt 으로 Date형 객체 입력)
);

userSchema.pre('save', function (next) {
    const user = this; // userSchema

    // user document의 'password' 가 수정되었을 경우. isModified가 document를 새로 추가하는 경우에도 동작함.
    if (user.isModified('password')) {
        // genSalt : salt 생성
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, function (err, hashedPassword) {
                if (err) return next(err);
                user.password = hashedPassword; // 평문 user.password를 hashedPassword 로 입력
                next(); // save 진행
            });
        });
    } else {
        // password 값이 변경되지 않을 경우
        next();
    }
});

module.exports = mongoose.model('Users', userSchema);
