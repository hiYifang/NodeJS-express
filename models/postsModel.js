const mongoose = require('mongoose');

// 建立 Schema
const postsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "請填寫創作者 ID"]
    },
    content: {
      type: String,
      required: [true, "請填寫貼文內容"],
    },
    image: {
      type: [String],
    },
    // 設計稿 8.我按讚的貼文
    likes: [{
      type: mongoose.Schema.ObjectId,
      ref: "User"
    }],
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
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postsSchema.virtual('comments', { // virtual(虛擬)：掛上 comments
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id' // 引用：類似 join
});

// 建立 Model
const Post = mongoose.model('Post', postsSchema);

module.exports = Post;