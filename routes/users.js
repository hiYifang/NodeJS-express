const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/usersControllers');
const { isAuth } = require('../service/auth');
const { handleErrorAsync } = require('../service/errorHandler');

// 取得個人資料
router.get('/profile', isAuth, handleErrorAsync(UsersControllers.getProfile));

// 取得個人按讚列表
router.get('/getLikeList', isAuth, handleErrorAsync(UsersControllers.getLikeList));

// 取得個人追蹤名單
router.get('/following', isAuth, handleErrorAsync(UsersControllers.getFollowList));

// 註冊會員
router.post('/sign_up', handleErrorAsync(UsersControllers.signUp));

// 登入會員
router.post('/sign_in', handleErrorAsync(UsersControllers.signIn));

// 追蹤朋友
router.post('/:userID/follow', isAuth, handleErrorAsync(UsersControllers.postFollow));

// 重設密碼
router.patch('/updatePassword', isAuth, handleErrorAsync(UsersControllers.updatePassword));

// 更新個人資料
router.patch('/profile', isAuth, handleErrorAsync(UsersControllers.patchProfile));

// 取消追蹤朋友
router.delete('/:userID/unfollow', isAuth, handleErrorAsync(UsersControllers.delFollow));

module.exports = router;
