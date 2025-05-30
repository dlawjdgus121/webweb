const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema(
    {
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        nickname: {
            type: String,
            required: true,
        },
        postId: {
            type: String,
            required: true,
            ref: 'Post',
        },
        userId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true } // createdAt, updatedAt 으로 Date형 객체 입력
);

commentsSchema.virtual('commentId').get(function () {
    return this._id.toHexString();
});
commentsSchema.set('toJSON', {
    virtuals: true,
});

const Comments = mongoose.model('Comments', commentsSchema);
module.exports = Comments;
