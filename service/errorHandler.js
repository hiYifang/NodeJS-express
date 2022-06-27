// 自定義 error
const appError = (httpStatus, errMessage, field = '') => {
  const error = new Error(errMessage)
  if (field !== '') { error.field = field };
  error.statusCode = httpStatus;
  error.isOperational = true;
  return error;
}

// async func catch
const handleErrorAsync = function (func) {
  return function (req, res, next) {
    func(req, res, next).catch(
      function (error) {
        return next(error);
      }
    )
  }
}

// 開發狀態：開發環境錯誤
const resErrorDev = (err, res) => {
  res.status(err.statusCode)
    .json({
      status: err.status,
      field: err.field,
      message: err.message,
      error: err,
      stack: err.stack
    })
}

// 上線狀態：自己設定的 err 錯誤
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'false',
      message: err.message
    });
  } else {
    // log 紀錄
    console.error('出現重大錯誤', err);
    // HTTP 狀態碼：500 -> 送出罐頭預設訊息
    res.status(500).json({
      status: 'error',
      message: '系統錯誤，請恰系統管理員'
    });
  }
}

const errorHandlerMainProcess = (err, req, res, next) => {
  if (err) {
    err.statusCode = err.statusCode || 500;
    // dev
    if (process.env.NODE_ENV === 'dev') {
      return resErrorDev(err, res);
    }
    // production
    if (process.env.NODE_ENV === 'production') {
      if (err.isAxiosError === true) {
        err.message = 'axios 連線錯誤';
        err.isOperational = true;
        return resErrorProd(err, res);
      } else if (err.name === 'CastError') {
        // mongoose 無法轉換值
        err.message = '無效的 ID，請重新確認！';
        err.isOperational = true;
        return resErrorProd(err, res);
      } else if (err.name === 'SyntaxError') {
        err.statusCode = 400;
        err.message = '語法結構錯誤，請重新確認！';
        err.isOperational = true;
        return resErrorProd(err, res);
      }
      return resErrorProd(err, res);
    }
  }
}

module.exports = {
  errorHandlerMainProcess,
  appError,
  resErrorDev,
  resErrorProd,
  handleErrorAsync
}