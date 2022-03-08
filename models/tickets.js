var mongoose = require("mongoose");

var TicketShema = new mongoose.Schema({
  idUser: {type:String,required:true},
  idEvent: {type:String,required:true}
});
mongoose.model('ticket', TicketShema);

module.exports = mongoose.model("tickets", TicketShema);
