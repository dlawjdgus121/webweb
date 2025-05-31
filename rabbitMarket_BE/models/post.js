const mongoose = require('mongoose');
const Comment = require('../models/comment');

const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            
        },
        imgurl: {
            type: String,
            required: true,
        },
        isSold: {
            type: Boolean,
              default: false,
        },
        nickname: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },      
    },

    { timestamps: true } // createdAt, updatedAt 으로 Date형 객체 입력
);

PostSchema.virtual('postId').get(function () {
    return this._id.toHexString();
});

PostSchema.set('toJSON', { virtuals: true });
PostSchema.pre('deleteOne', { document: false, query: true }, async function (next) {
    // post id
    const { _id } = this.getFilter();

    // 관련 댓글 삭제
    await Comment.deleteMany({ postId: _id });
    next();
});

module.exports = mongoose.model('Posts', PostSchema);
