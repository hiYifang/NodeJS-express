const mongoose = require('mongoose');

// 建立 Schema
const commentsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "請填寫創作者 ID"]
    },
    comment: {
      type: String,
      required: [true, '請填寫留言內容'],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'Post',
      require: [true, '請填寫貼文 ID'],
    },
    createdAt: { // 建立時間
      type: Date,
      default: Date.now
    },
    updatedAt: { // 更新時間
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false
  }
);

commentsSchema.pre(/^find/, function (next) { // 前置器：使用 find 找尋 collections 裡面的資料
  this.populate({
    path: 'user',
    select: 'id nickName createdAt'
  });
  next();
});

// 建立 Model
const Comment = mongoose.model('Comment', commentsSchema);

module.exports = Comment;