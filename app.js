if (process.env.NODE_ENV !== 'production'){ //是否在開發模式運行
  require("dotenv").config() //訪問env文件的變量
}



const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const session = require("express-session")
const ExpressError = require("./utils/ExpressError")
const methodOverride = require('method-override')

const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")



// mongoose.connect(process.env.DB_URL)。
mongoose.connect(process.env.DB_URL || "mongodb://localhost:27017/yelp-camp")
  .then(()=>{
    console.log("OPEN YA~")
  })
  .catch(err=>{
    console.log("ERROR")
    console.log(err)
  })

const app = express()



const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  // "https://api.tiles.mapbox.com/",
  // "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  // "https://api.mapbox.com/",
  // "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
  // "https://api.mapbox.com/",
  // "https://a.tiles.mapbox.com/",
  // "https://b.tiles.mapbox.com/",
  // "https://events.mapbox.com/",
  "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
              // all your other existing code
              
              // add this:
              src="https://res.cloudinary.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);





app.engine('ejs',ejsMate)
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname,'public')))

app.use(mongoSanitize()) //mongo防注入
app.use(helmet({contentSecurityPolicy:false}))
//***********************************************
const secret = process.env.SECRET || "secret"
const MongoStore = require('connect-mongo');
const store = MongoStore.create({
  mongoUrl:"mongodb://localhost:27017/yelp-camp",
  touchAfter:24*60*60,
  crypto: {
    secret
}
  ,
})


//cookie and session
const sessionConfig = {
  store,
  secret,
  resave:false,
  saveUninitialized:true,
  cookie:{
    httpOnly:true,
    expires:Date.now() + 1000 * 60 * 60 * 24 * 7,//過期時間
    maxAge:1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))
//***********************************************

//***********************************************
// Passport
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())) //註冊本地策略，傳入用戶模型(身分驗證的方式)

passport.serializeUser(User.serializeUser()) //序列化
passport.deserializeUser(User.deserializeUser()) //反序列化
//***********************************************

//***********************************************
// flash
const flash = require('connect-flash')
app.use(flash())

app.use((req,res,next) => {

  res.locals.currentUser = req.user; //自動填充會話中的序列化訊息
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next()
})


//***********************************************



//***********************************************
// Routes
const userRoutes = require("./routes/user")
const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")

app.use("/",userRoutes)
app.use("/campgrounds",campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)

//***********************************************


app.get("/",(req,res)=>{
  res.render("home.ejs")
})

app.all("*",(req,res,next) => {
  next(new ExpressError("Page Not Found",404))
})

//錯誤處理中間件
app.use((err,req,res,next) => {
  const {statusCode = 500} = err;
  if (!err.message) err.message = "OH WRONG!"
  res.status(statusCode).render("error",{err}) //顯示error視圖
})


app.listen(3000,()=>{
  console.log("port 3000")
})


