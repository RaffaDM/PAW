var mongoose = require('mongoose');

var adminShema = new mongoose.Schema({
    email: {type:String,required:true},
    password: {type:String,required:true},
    permission: Number
});

module.exports = mongoose.model('admins', adminShema);