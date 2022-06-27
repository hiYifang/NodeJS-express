const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const uploadsRouter = require('./routes/uploads');

const app = express();

require('./connections/db');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* 流量限制 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 1000
});
app.use(globalLimiter);

app.use('/posts', postsRouter);
app.use('/users', usersRouter);
app.use('/uploads', uploadsRouter);

/* 錯誤處理 */
require('./service/process');
const { appError, errorHandlerMainProcess } = require('./service/errorHandler');
// HTTP 狀態碼：404
app.use((req, res, next) => {
  next(appError(404, '無此路由資訊', 'routes'));
});
app.use(errorHandlerMainProcess);

module.exports = app;
