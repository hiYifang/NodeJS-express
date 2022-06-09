const express = require('express');
const router = express.Router();
const UploadsControllers = require('../controllers/uploadsController');
const { isAuth } = require('../service/auth');
const upload = require('../service/upload');

// 上傳圖片
router.post('/', isAuth, upload, UploadsControllers.postImage);

module.exports = router;