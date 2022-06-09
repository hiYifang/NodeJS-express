const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/usersControllers');
const { isAuth } = require('../service/auth');

// 取得個人資料
router.get('/profile', isAuth, UsersControllers.getProfile);

// 取得個人按讚列表
router.get('/getLikeList', isAuth, UsersControllers.getLikeList);

// 取得個人追蹤名單
router.get('/following', isAuth, UsersControllers.getFollowList);

// 註冊會員
router.post('/sign_up', UsersControllers.signUp);

// 登入會員
router.post('/sign_in', UsersControllers.signIn);

// 追蹤朋友
router.post('/:userID/follow', isAuth, UsersControllers.postFollow);

// 重設密碼
router.patch('/updatePassword', isAuth, UsersControllers.updatePassword);

// 更新個人資料
router.patch('/profile', isAuth, UsersControllers.patchProfile);

// 取消追蹤朋友
router.delete('/:userID/unfollow', isAuth, UsersControllers.delFollow);

module.exports = router;
