const mongoose = require('mongoose');

// 建立 Schema
const usersSchema = new mongoose.Schema(
  {
    nickName: {
      type: String,
      required: [true, '請填寫暱稱']
    },
    gender: {
      // 男性: 0，女性: 1，跨性別: 2
      type: Number,
      default: 0,
      enum: [0, 1, 2]
    },
    avatar: {
      type: String,
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
    followers: [ // 自己
      {
        user: { type: mongoose.Schema.ObjectId, ref: 'User' },
        createdAt: { // 建立時間
          type: Date,
          default: Date.now
        },
        updatedAt: { // 更新時間
          type: Date,
          default: Date.now
        },
      }
    ],
    following: [ // 別人
      {
        user: { type: mongoose.Schema.ObjectId, ref: 'User' },
        createdAt: { // 建立時間
          type: Date,
          default: Date.now
        },
        updatedAt: { // 更新時間
          type: Date,
          default: Date.now
        },
      }
    ],
    createdAt: { // 建立時間
      type: Date,
      default: Date.now
    },
    updatedAt: { // 更新時間
      type: Date,
      default: Date.now
    },
  },
  {
    versionKey: false
  }
);

// 建立 Model
const User = mongoose.model('User', usersSchema);

module.exports = User;