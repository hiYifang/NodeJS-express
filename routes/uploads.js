const express = require('express');
const router = express.Router();
const UploadsControllers = require('../controllers/uploadsController');
const { isAuth } = require('../service/auth');
const upload = require('../service/upload');
const { handleErrorAsync } = require('../service/errorHandler');

// δΈε³εη
router.post('/', isAuth, upload, handleErrorAsync(UploadsControllers.postImage));

module.exports = router;