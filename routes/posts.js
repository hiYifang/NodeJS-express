const express = require('express');
const router = express.Router();
const PostsControllers = require('../controllers/postsControllers');
const { isAuth } = require('../service/auth');
const { handleErrorAsync } = require('../service/errorHandler');

// 取得所有貼文
router.get('/', isAuth, handleErrorAsync(PostsControllers.getPosts));

// 取得個人所有貼文列表
router.get('/user/:userID', isAuth, handleErrorAsync(PostsControllers.getOwnPosts));

// 取得單一貼文
router.get('/:postID', isAuth, handleErrorAsync(PostsControllers.getPost));

// 新增貼文
router.post('/', isAuth, handleErrorAsync(PostsControllers.insertPost));

// 新增一則貼文的留言
router.post('/:postID/comment', isAuth, handleErrorAsync(PostsControllers.insertComment));

// 新增一則貼文的讚
router.post('/:postID/like', isAuth, handleErrorAsync(PostsControllers.insertLike));

// 取消一則貼文的讚
router.delete('/:postID/unlike', isAuth, handleErrorAsync(PostsControllers.delLike));

module.exports = router;