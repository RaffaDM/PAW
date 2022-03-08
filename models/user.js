var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
  fname: {type:String,required:true},
  lname: {type:String,required:true},
  gender: {
    type: String,
    enum: ["M", "F"],
    default: "M",
    required: true,
  },
  password: {type:String,required:true},
  email: {type:String,required:true},
  permission: Number,
  nCancel: Number, //Number of times that user cancels a event
  timeStamp: Date, // to check if the user cancel 5 events in the same month
  suspended:Boolean
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model("users", UserSchema);
