module.exports.isLoggedIn = (req,res,next) => {
  if (!req.isAuthenticated()){ //passport方法，檢查是否通過身分驗證
    req.session.returnTo = req.originalUrl
    req.flash("error",'you must be signed in')
    return res.redirect("/login")
  }
  next()
}

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
      res.locals.returnTo = req.session.returnTo; //將用戶位置增加到locals(全域)
  }
  next();
}

const ExpressError = require("./utils/ExpressError")
const {campgroundSchema} = require("./schemas.js")
//中間件，使用Joi檢查提交數據是否符合標準
module.exports.validateCampground = (req,res,next) => {
  const {error} = campgroundSchema.validate(req.body);
  if (error){
    const msg = error.details.map(el=>el.message).join(",")
    throw new ExpressError(msg,400)
  } else{
    next();
  }
}

const Campground = require("./models/campground")
module.exports.isAuthor = async(req,res,next) => {
  const {id} = req.params
  const campground = await Campground.findById(id)
  if (!campground.author.equals(req.user._id)){  //檢查營地作者和登入用戶ID是否匹配  
    req.flash("error","沒有權限執行此操作!")
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

const {reviewSchema} = require("./schemas.js")
//中間件，使用Joi檢查提交的 評論數據 是否符合標準
module.exports.validateReview = (req,res,next) => {
  const {error} = reviewSchema.validate(req.body);
  if (error){
    const msg = error.details.map(el=>el.message).join(",")
    throw new ExpressError(msg,400)
  } else{
    next()
  }
}



const Review = require("./models/review")
module.exports.isReviewAuthor = async(req,res,next) => {
  const {reviewId,id} = req.params
  const review = await Review.findById(reviewId)
  if (!review.author.equals(req.user._id)){  //檢查評論作者和登入用戶ID是否匹配  
    req.flash("error","沒有權限執行此操作!")
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}