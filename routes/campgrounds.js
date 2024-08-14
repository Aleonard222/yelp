const express = require("express")
const router = express.Router()
const catchAsync = require("../utils/catchAsync")
const ExpressError = require("../utils/ExpressError")
const { isLoggedIn,validateCampground,isAuthor } = require("../middleware")
const Campground = require("../models/campground")
const campground = require("../controllers/campgrounds")

const multer = require("multer")
const {storage} = require("../cloudinary")
const upload = multer({storage})

router.route("/")
  .get(catchAsync(campground.index)) //所有露營地
  .post(isLoggedIn,upload.array("image"),validateCampground,catchAsync(campground.createCampground)) //提交新增露營地


//新增露營地頁面
router.get("/new",isLoggedIn,campground.renderNewForm)

router.route("/:id") 
  .get(catchAsync(campground.showCampground)) //指定營地頁面
  .put(isLoggedIn,isAuthor,upload.array("image"),validateCampground,catchAsync(campground.updateCampground)) //提交編輯指定露營地
  .delete(isLoggedIn,isAuthor,catchAsync(campground.deleteCampground)) //刪除指定露營地


//編輯指定露營地頁面
router.get("/:id/edit",isLoggedIn,isAuthor,catchAsync(campground.renderEditForm))


module.exports = router
