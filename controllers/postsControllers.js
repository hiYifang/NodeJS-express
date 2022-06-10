const { appError, handleErrorAsync } = require('../service/errorHandler');
const getHttpResponse = require('../service/successHandler');

const validator = require('validator');

const mongoose = require('mongoose');
const User = require('../models/usersModel');
const Post = require('../models/postsModel');
const Comment = require('../models/commentsModel');

const posts = {
  // 取得所有貼文
  getPosts: handleErrorAsync(async (req, res) => {
    const {
      query: {
        q,
        sort = 'desc'
      }
    } = req;
    const filter = q ? { content: new RegExp(q) } : {};
    const posts = await Post.find(filter)
      .populate({ path: 'user', select: 'nickName avatar' })
      .populate({
        path: 'comments',
        select: 'comment user'
      }).sort({ createdAt: sort === 'desc' ? -1 : 1 });
    res.status(200).json(getHttpResponse(posts));
  }),
  // 取得個人所有貼文列表
  getOwnPosts: handleErrorAsync(async (req, res, next) => {
    const {
      params: {
        userID
      },
      query: {
        q,
        sort = 'desc'
      }
    } = req;

    if (!(userID && mongoose.Types.ObjectId.isValid(userID))) {
      return next(appError(400, "請傳入特定的會員", "userID"))
    }

    const existedUser = await User.findById(userID);
    if (!existedUser) {
      return next(appError(400, "尚未註冊成為會員", "userID"))
    }

    const filter = { user: userID };
    if (q) filter.content = new RegExp(q, 'i');
    const post = await Post.find(filter)
      .populate({ path: 'user', select: 'nickName avatar' })
      .populate({
        path: 'comments',
        select: 'comment user'
      }).sort({ createdAt: sort === 'desc' ? -1 : 1 });

    res.status(200).json(getHttpResponse({
      results: post.length,
      post
    }));
  }),
  // 取得單一貼文
  getPost: handleErrorAsync(async (req, res, next) => {
    const {
      params: { postID }
    } = req;

    if (!(postID && mongoose.Types.ObjectId.isValid(postID))) {
      return next(appError(400, "請傳入特定的貼文", "postID"))
    }

    const existedPost = await Post.findById(postID)
      .populate({ path: 'user', select: 'nickName avatar' })
      .populate({
        path: 'comments',
        select: 'comment user'
      })

    if (!existedPost) {
      return next(appError(400, "尚未發布貼文", "postID"));
    }

    res.status(200).json(getHttpResponse(existedPost));
  }),
  // 新增貼文
  insertPost: handleErrorAsync(async (req, res, next) => {
    const {
      user,
      body: {
        content,
        image
      }
    } = req;

    // 判斷圖片開頭是否為 http
    if (image && image.length > 0) {
      image.forEach(function (item) {
        let result = item.split(":");
        if (!validator.equals(result[0], 'https')) {
          return next(appError(400, "新增失敗，圖片格式不正確", "image"))
        }
      });
    }

    if (!content) {
      return next(appError(400, "新增失敗，內容未正確填寫", "image"))
    }

    const newPost = await Post.create({
      user: user._id,
      content,
      image
    });
    res.status(201).json(getHttpResponse(newPost));
  }),
  // 新增一則貼文的留言
  insertComment: handleErrorAsync(async (req, res, next) => {
    const {
      user,
      params: {
        postID
      },
      body: {
        comment
      }
    } = req;

    if (!(postID && mongoose.Types.ObjectId.isValid(postID))) {
      return next(appError(400, "請傳入特定的貼文", "postID"))
    }

    const existedPost = await Post.findById(postID);
    if (!existedPost) {
      return next(appError(400, "尚未發布貼文", "postID"))
    }

    const newComment = await Comment.create({
      user: user._id,
      post: postID,
      comment
    });

    const postComment = await Comment.findById(newComment._id);
    res.status(200).json(getHttpResponse(postComment));
  }),
  // 新增一則貼文的讚
  insertLike: handleErrorAsync(async (req, res, next) => {
    const {
      user,
      params: {
        postID
      },
    } = req;

    if (!(postID && mongoose.Types.ObjectId.isValid(postID))) {
      return next(appError(400, "請傳入特定的貼文", "postID"))
    }

    const existedPost = await Post.findById(postID);
    if (!existedPost) {
      return next(appError(400, "尚未發布貼文", "postID"))
    }
    if (existedPost.likes.includes(user._id)) {
      return next(appError(400, "已對該貼文按讚", "postID"))
    }

    await Post.findOneAndUpdate(
      {
        _id: postID
      },
      {
        $addToSet: {
          likes: user.id
        }
      } // 存在重複的 id 就不會 push
    );
    res.status(200).json(getHttpResponse({ message: '已按讚！' }));
  }),
  // 取消一則貼文的讚
  delLike: handleErrorAsync(async (req, res, next) => {
    const {
      user,
      params: {
        postID
      },
    } = req;

    if (!(postID && mongoose.Types.ObjectId.isValid(postID))) {
      return next(appError(400, "請傳入特定的貼文", "postID"))
    }

    const existedPost = await Post.findById(postID);
    if (!existedPost) {
      return next(appError(400, "尚未發布貼文", "postID"))
    }
    if (!existedPost.likes.includes(user._id)) {
      return next(appError(400, "尚未對該貼文按讚", "postID"))
    }

    await Post.findOneAndUpdate(
      {
        _id: postID
      },
      {
        $pull: {
          likes: user.id
        }
      } // id 存在才會執行 delete
    );
    res.status(200).json(getHttpResponse({ message: '已取消按讚！' }));
  })
}

module.exports = posts;