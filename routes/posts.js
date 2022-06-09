const express = require('express');
const router = express.Router();
const PostsControllers = require('../controllers/postsControllers');
const { isAuth } = require('../service/auth');

// 取得所有貼文
router.get('/', isAuth, PostsControllers.getPosts);

// 取得個人所有貼文列表
router.get('/user/:userID', isAuth, PostsControllers.getOwnPosts);

// 取得單一貼文
router.get('/:postID', isAuth, PostsControllers.getPost);

// 新增貼文
router.post('/', isAuth, PostsControllers.insertPost);

// 新增一則貼文的留言
router.post('/:postID/comment', isAuth, PostsControllers.insertComment);

// 新增一則貼文的讚
router.post('/:postID/like', isAuth, PostsControllers.insertLike);

// 取消一則貼文的讚
router.delete('/:postID/unlike', isAuth, PostsControllers.delLike);

module.exports = router;