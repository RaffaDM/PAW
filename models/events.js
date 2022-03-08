var mongoose = require("mongoose");

var EventsSchema = new mongoose.Schema({
  name: {type:String,required:true},
  category:{
    type:String,
    enum: ["Concert", "SunSet","Party","Meeting"],
    default: "Concert",
    required:true
  },
  address: {
    street: {type:String,required:true},
    post_code: {type:String,required:true},
    city: {type:String,required:true},
    country: {type:String,required:true},
  },
  capacity: {type:Number,required:true},
  current:Number, //Current stands for the current capacity
  date: Date,
  price: {type:Number,required:true},
  activate: Boolean,
  id_Promoter:String  // to identify the promoter (who created the event)
});

module.exports = mongoose.model("events", EventsSchema);
