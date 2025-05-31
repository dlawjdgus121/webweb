const mongoose = require('mongoose');
require('dotenv').config();

//ec2 데이터베이스
const connect = () => {
    mongoose
        .connect(process.env.MONGO_DB, {
            ignoreUndefined: true,
        })
        .catch((err) => {
            console.error(err);
        });
};

// const connect = () => {
//     mongoose.connect(
//         'mongodb://localhost:27017/localrabbit',
//         { ignoreUndefined: true },
//         (error) => {
//             if (error) {
//                 console.log('mongodb error', error);
//             } else {
//                 console.log('connected');
//             }
//         }
//     );
// };

module.exports = connect;
