const { appError, handleErrorAsync } = require('../service/errorHandler');
const getHttpResponse = require('../service/successHandler');

const bcrypt = require('bcryptjs');
const validator = require('validator');
const { getJWT } = require('../service/auth');

const mongoose = require('mongoose');
const User = require('../models/usersModel');
const Post = require('../models/postsModel');

const users = {
  // 取得個人資料
  getProfile: handleErrorAsync(async (req, res) => {
    const { user } = req;
    res.status(200).json(getHttpResponse(user));
  }),
  // 取得個人按讚列表
  getLikeList: handleErrorAsync(async (req, res) => {
    const { user } = req;
    const likeList = await Post.find({
      likes: { $in: [user.id] }
    }).populate({
      path: "user",
      select: "_id nickName"
    }).select('-messages')
      .sort({
        createdAt: -1,
      });
    res.status(200).json(getHttpResponse(likeList));
  }),
  // 取得個人追蹤名單
  getFollowList: handleErrorAsync(async (req, res) => {
    const { user } = req;
    const following = await User.find({ user: user._id })
      .populate({ path: 'following.user', select: 'nickName avatar' });
    res.status(200).json(getHttpResponse(following));
  }),
  // 註冊會員
  signUp: handleErrorAsync(async (req, res, next) => {
    const { 
      body: { 
        email,
        password,
        nickName
      }
    } = req;
    const emailExist = await User.findOne({ email });

    if (!nickName) {
      return next(appError(400, "註冊失敗，請填寫暱稱欄位", "nickName"))
    } else if (!validator.isLength(nickName, { min: 2 })) {
      return next(appError(400, "暱稱至少 2 個字元以上", "nickName"))
    }

    if (!email) {
      return next(appError(400, "註冊失敗，請填寫 Email 欄位", "email"))
    } else if (!validator.isEmail(email)) {
      return next(appError(400, "Email 格式錯誤，請重新填寫 Email 欄位", "email"))
    } else if (emailExist) {
      return next(appError(400, "Email 已被註冊，請替換新的 Email", "email"))
    }

    if (!password) {
      return next(appError(400, "註冊失敗，請填寫 Password 欄位", "password"))
    } else if (!validator.isStrongPassword(password,
      {
        minLength: 8,
        minUppercase: 0,
        minSymbols: 0,
      })
    ) {
      return next(appError(400, "密碼需至少 8 碼以上，並英數混合", "password"))
    }

    password = await bcrypt.hash(req.body.password, 12); // 加密密碼
    const newUser = await User.create({
      email,
      password,
      nickName
    });
    res.status(201).json(getHttpResponse({
      token: getJWT(newUser),
      id: newUser._id
    }));
  }),
  // 登入會員
  signIn: handleErrorAsync(async (req, res, next) => {
    const { 
      body: { 
        email,
        password 
      }
    } = req;

    if (!email) {
      return next(appError(400, "登入失敗，請重新填寫 Email 欄位", "email"))
    } else if (!validator.isEmail(email)) {
      return next(appError(400, "Email 格式錯誤，請重新填寫 Email 欄位", "email"))
    }

    if (!password) {
      return next(appError(400, "登入失敗，請重新填寫 Password 欄位", "password"))
    } else if (!validator.isStrongPassword(password,
      {
        minLength: 8,
        minUppercase: 0,
        minSymbols: 0,
      })
    ) {
      return next(appError(400, "密碼需至少 8 碼以上，並英數混合", "password"))
    }

    const user = await User.findOne({ email }).select('+password'); // 顯示密碼
    if (!user) {
      return next(appError(400, 'Email 填寫錯誤或尚未註冊', "email"));
    }

    const auth = await bcrypt.compare(password, user.password); // 比對密碼
    if (!auth) {
      return next(appError(400, "登入失敗，密碼不正確", "password"))
    }
    res.status(201).json(getHttpResponse({
      token: getJWT(user),
      id: user._id
    }));
  }),
  // 追蹤朋友
  postFollow: handleErrorAsync(async (req, res, next) => {
    const {
      user,
      params: { userID }
    } = req;

    if (!(userID && mongoose.Types.ObjectId.isValid(userID))) {
      return next(appError(400, "請傳入特定的追蹤會員", "userID"))
    }

    if (userID === user.id) {
      return next(appError(400, "無法追蹤自己", "userID"))
    }

    const existedUser = await User.findById(userID);
    if (!existedUser) {
      return next(appError(400, "追蹤的會員尚未註冊", "userID"))
    }

    await User.updateOne(
      {
        _id: user.id,
        'following.user': { $ne: userID }
      },
      {
        $addToSet: { following: { user: userID } }
      }
    );
    await User.updateOne(
      {
        _id: userID,
        'followers.user': { $ne: user.id }
      },
      {
        $addToSet: { followers: { user: user.id } }
      }
    );
    res.status(200).json(getHttpResponse({ message: '已追蹤！' }));
  }),
  // 重設密碼
  updatePassword: handleErrorAsync(async (req, res, next) => {
    const { 
      user, 
      body: { 
        password,
        confirmPassword 
      }
    } = req;

    if (!password) {
      return next(appError(400, "設定失敗，請填寫 Password 欄位", "password"))
    } else if (!validator.isStrongPassword(password,
      {
        minLength: 8,
        minUppercase: 0,
        minSymbols: 0,
      })
    ) {
      return next(appError(400, "密碼需至少 8 碼以上，並英數混合", "password"))
    } else if (!confirmPassword) {
      return next(appError(400, "設定失敗，請填寫 confirmPassword 欄位！", "confirmPassword"));
    } else if (!validator.equals(confirmPassword, password)) {
      return next(appError(400, "驗證失敗，密碼不一致！", "password"));
    }

    newPassword = await bcrypt.hash(password, 12); // 加密密碼
    await User.updateOne({ _id: user._id }, { password: newPassword });
    res.status(201).json(getHttpResponse({ message: "更新密碼成功" }));
  }),
  // 更新個人資料
  patchProfile: handleErrorAsync(async (req, res, next) => {
    const { 
      user, 
      body: { 
        nickName, 
        gender, 
        avatar 
      } 
    } = req;

    if (!nickName) {
      return next(appError(400, "更新失敗，請填寫暱稱欄位", "nickName"))
    } else if (!gender) {
      return next(appError(400, "更新失敗，請填寫性別欄位", "gender"))
    } else if (!validator.isLength(nickName, { min: 2 })) {
      return next(appError(400, "暱稱至少 2 個字元以上", "nickName"))
    } else if (avatar && !avatar.startsWith('https')) {
      return next(appError(400, "更新失敗，請確認大頭照的圖片網址", "avatar"));
    }

    await User.findByIdAndUpdate(user._id, { nickName, gender, avatar });
    res.status(201).json(getHttpResponse({ message: "更新個人資料成功" }));
  }),
  // 取消追蹤朋友
  delFollow: handleErrorAsync(async (req, res, next) => {
    const {
      user,
      params: { userID }
    } = req;

    if (!(userID && mongoose.Types.ObjectId.isValid(userID))) {
      return next(appError(400, "請傳入特定的追蹤會員", "userID"))
    }

    if (userID === user.id) {
      return next(appError(400, "無法追蹤自己", "userID"))
    }

    const existedUser = await User.findById(userID);
    if (!existedUser) {
      return next(appError(400, "追蹤的會員尚未註冊", "userID"))
    }

    await User.updateOne(
      {
        _id: user.id
      },
      {
        $pull: { following: { user: userID } }
      }
    );

    await User.updateOne(
      {
        _id: userID
      },
      {
        $pull: { followers: { user: user.id } }
      }
    );

    res.status(200).json(getHttpResponse({ message: '已取消追蹤！' }));
  })
}

module.exports = users;