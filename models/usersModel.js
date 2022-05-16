const mongoose = require('mongoose');

// 建立 Schema
const usersSchema = new mongoose.Schema(
  {
    nickName: {
      type: String,
      required: [true, '請填寫暱稱']
    },
    gender: {
      type: Number,
      enum: [0, 1, 2], // 0:男性, 1:女性, 2:跨性別
      default: 0,
    },
    avatar: String,
    role: {
      type: Array,
      enum: ["admin", "user"],
    },
    email: {
      type: String,
      required: [true, "請填寫 Email"],
      unique: true,
      lowercase: true,
      select: false
    },
    password: {
      type: String,
      required: [true, "請填寫密碼"],
      minlength: 8,
      select: false
    },
    // 設計稿 4.追蹤名單
    follower: { // 別人 -> 自己
      type: mongoose.Schema.ObjectId,
      ref: "User"
    },
    following: { // 自己 -> 別人
      type: mongoose.Schema.ObjectId,
      ref: "User"
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    },
  },
  {
    versionKey: false
  }
);

// 建立 Model
const User = mongoose.model('User', usersSchema);

module.exports = User;