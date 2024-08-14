const mongoose = require("mongoose")
const Schema = mongoose.Schema
const passportLocalMongoose = require("passport-local-mongoose")

const UserSchema = new Schema({
  email:{
    type:String,
    require:true,
    unique:true
  }
})

UserSchema.plugin(passportLocalMongoose) //使用插件 自動在模型添加username和hash字段

module.exports = mongoose.model("User",UserSchema)