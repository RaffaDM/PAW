var mongoose = require("mongoose");

var PromoterSchema = new mongoose.Schema({
  fname: { type:String, required: true },
  lname: { type:String, required: true },
  gender: {
    type: String,
    enum: ["M", "F"],
    default: "M",
    required: true,
  },
  email: { type:String, required: true },
  password: { type:String, required: true },
  permission: Number,
  nEvents: Number, // Number of events of the promoter
});
mongoose.model("Promoter", PromoterSchema);

module.exports = mongoose.model("promoters", PromoterSchema);
