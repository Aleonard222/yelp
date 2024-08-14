const express = require("express")
const router = express.Router({mergeParams:true})

const reviews = require("../controllers/reviews")
const {validateReview,isLoggedIn,isReviewAuthor} = require("../middleware")
const catchAsync = require("../utils/catchAsync")
const ExpressError = require("../utils/ExpressError")


//提交評論
router.post("/",isLoggedIn,validateReview,catchAsync(reviews.createReview))
//刪除評論
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview))

module.exports = router