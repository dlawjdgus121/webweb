require('dotenv').config();
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, S3_BUCKET_REGION, S3_BUCKET_NAME } = process.env;

//dot env 로 환경변수 모두 숨김
const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: S3_BUCKET_REGION,
});

//upload 라는 변수에 multer를 사용하여 s3에 원하는 형태의 파일 형식을 저장
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: S3_BUCKET_NAME,
       
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(
                null,
                Math.floor(Math.random() * 1000).toString() +
                    Date.now() +
                    '.' +
                    file.originalname.split('.').pop()
            );
        },
    }),
    limits: { fileSize: 1000 * 1000 * 10 },
});





console.log(process.env.S3_BUCKET_NAME);
exports.upload = upload; // ✅ 올바른 방식

