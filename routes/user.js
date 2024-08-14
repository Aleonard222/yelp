const express = require("express")
const router = express.Router()
const catchAsync = require("../utils/catchAsync")
const passport = require("passport")
const {storeReturnTo} = require("../middleware")
const user = require("../controllers/users")

router.route("/register")
  .get(user.renderRegister)
  .post(catchAsync(user.register))

router.route("/login")
  .get(user.renderLogin)
  .post(storeReturnTo,passport.authenticate( //登入使用中間件(獲取重定向位置、處理本地身分驗證)
    'local',{failureFlash:true,failureRedirect:"/login"}), //參數2驗證失敗:錯誤消息存到閃存，重定向位置
    user.login)

//登出 
router.get("/logout",user.logout)

module.exports = router