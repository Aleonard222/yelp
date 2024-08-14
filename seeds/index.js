const mongoose = require("mongoose")
const cities = require("./cities")
const {places,descriptors} = require("./seedHelpers")
const Campground = require("../models/campground")


mongoose.connect("mongodb://localhost:27017/yelp-camp")
  .then(()=>{
    console.log("OPEN YA~")
  })
  .catch(err=>{
    console.log("ERROR")
    console.log(err)
  })

const sample = array=>array[Math.floor(Math.random() * array.length)]

const seedDB = async()=>{
  await Campground.deleteMany({});
  for(let i = 0 ; i < 200 ; i++ ){
    const price = Math.floor(Math.random() * 20) + 10
    const random100 = Math.floor(Math.random() * 1000)
    const camp = new Campground({
      author:'66b5aa447f9ea67ddfddc145',
      location:`${cities[random100].city},${cities[random100].state}`,
      title:`${sample(descriptors)} ${sample(places)}`,
      image:`https://picsum.photos/400?random=${Math.random()}`,
      description:"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Minus provident distinctio obcaecati iusto ullam qui, porro error vel fugit, quisquam est quos asperiores. Quia sed culpa non assumenda quos laboriosam.",
      price,
      geometry:{
        type:"Point",
        coordinates:[
          cities[random100].longitude,
          cities[random100].latitude,
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dzo1hxmof/image/upload/v1723451509/YelpCamp/pzikq4y6cxd85jpnmblv.jpg',
          filename: 'YelpCamp/pzikq4y6cxd85jpnmblv'
        },
        {
          url: 'https://res.cloudinary.com/dzo1hxmof/image/upload/v1723451510/YelpCamp/fjyu0u8wjhxhoipiixj2.jpg',
          filename: 'YelpCamp/fjyu0u8wjhxhoipiixj2'
        }
      ]

    })
    await camp.save()
  }
}
seedDB().then(()=>{
  mongoose.connection.close()
})