const Campground = require("../models/campground")
const {cloudinary} = require("../cloudinary")

const maptilerClient = require("@maptiler/client"); //地圖
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY; //地圖







module.exports.index = async(req,res)=>{
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index",{campgrounds})
}

module.exports.renderNewForm = (req,res)=>{
  res.render("campgrounds/new")
}

module.exports.createCampground = async(req,res,next)=>{

  const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 }); //地圖
  const campground = new Campground(req.body.campground); 
  campground.geometry = geoData.features[0].geometry; //地圖
  
  campground.images = req.files.map(f => ({url:f.path,filename:f.filename}))
  campground.author = req.user._id //露營地作者關聯用戶ID
  await campground.save()
  req.flash("success",'Successfully made a new campground!')
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async(req,res)=>{
  const campground = await Campground.findById(req.params.id).populate({
    path: 'reviews',
    populate: {
        path: 'author'
    }
}).populate('author'); //嵌套 填充
  if (!campground){
    req.flash('error','Cannot find that campground!')
    return res.redirect("/campgrounds")
  }
  res.render("campgrounds/show",{campground})
}

module.exports.renderEditForm = async(req,res)=>{
  const {id} = req.params
  const campground = await Campground.findById(id)
  if (!campground){ //找不到該營地
    req.flash('error','Cannot find that campground!')
    return res.redirect("/campgrounds")
  }
  res.render("campgrounds/edit",{campground})
}

module.exports.updateCampground = async(req,res)=>{
  const {id} = req.params
  const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
  const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 }); //地圖
  campground.geometry = geoData.features[0].geometry; //地圖
  const imgs = req.files.map(f => ({url:f.path,filename:f.filename}))
  campground.images.push(...imgs)
  await campground.save()
  
  if (req.body.deleteImages){
    for (let filename of req.body.deleteImages){
      await cloudinary.uploader.destroy(filename) //雲服務刪除輸入文件名
    } 
    await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}}) //mongo刪除所有選中圖片
  }

  req.flash("success",'Successfully updated campground!')
  res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async(req,res)=>{
  const {id} = req.params
  const campground = await Campground.findById(id)
  if (!campground.author.equals(req.user._id)){  //檢查營地作者和登入用戶ID是否匹配  
    req.flash("error","沒有權限執行此操作!")
    return res.redirect(`/campgrounds/${id}`)
  }
  await Campground.findByIdAndDelete(id)
  req.flash("success",'Successfully deleted campground')
  res.redirect(`/campgrounds`)
}
