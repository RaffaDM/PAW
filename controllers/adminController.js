var mongoose = require("mongoose");
var Promoter = require("../models/promoter");
var User = require("../models/user");
var Admin = require("../models/admin");
var authController = require("../controllers/authController");
var bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../jwt_secret/config");
const { db } = require("../models/promoter");
var Tickets = require("../models/tickets");
var Events = require("../models/events");

var adminController = {};

// create a user or promoter, depending on the permission submited
adminController.create = function (req, res) {
  authController.create(req, res);
};
//!Users
//show Users
adminController.showUsers = function (req, res) {
  User.find({}).exec((err, dbUsers) => {
    if (err) {
      next(err);
    } else {
      res.json(dbUsers);
    }
  });
};
//show specific user
adminController.showUser = function (req, res) {
  User.findOne({ _id: req.params.id }).exec((err, dbUsers) => {
    if (err) {
      next(err);
    } else {
      res.json(dbUsers);
    }
  });
};
//edit user
adminController.editUser = function (req, res) {
  Admin.findOne({ email: req.body.email }).exec((err, dbAdmin) => {
    if (err) {
      next(err);
    }if(dbAdmin !== null){
      console.log(dbAdmin)
      res.status(500).send({message:"O Admin tem esse email!"});
    }else{
        Promoter.findOne({ email: req.body.email }).exec((err, dbPromoters) => {
            if (err) {
              next(err);
            } else {
              if(dbPromoters !== null ){
                res.status(500).send({message:"Um promoter já têm esse email"});
              }else{
                User.findOne({ email: req.body.email }).exec((err, dbUsers) => {
                    if (err) {
                      next(err);
                    } else {
                      if(dbUsers !== null && dbUsers._id != req.params.id){
                        res.status(500).send({message:"Um User Já tem esse email"});
                      }else{
                        if(bcrypt.compareSync(req.body.password,dbUsers.password)){
                          req.body.password= dbUsers.password;
                        }else{
                          req.body.password= bcrypt.hashSync(req.body.password, 8);
                        }
                        User.findByIdAndUpdate(req.params.id, req.body, (err, editedUser) => {
                          if (err) {
                            next(err);
                          } else {
                            res.json(editedUser);
                          }
                        });
                      }
                    }
                  });
              }
            }
          })
      }
    }
  )
};
//delete User
adminController.deleteUser = function (req, res) {
  User.remove({ _id: req.params.id }).exec((err, deletedUser) => {
    if (err) {
      next(err);
    } else {
      Tickets.remove({idUser : req.params.id}).exec((err, dbTicket)=>{
        if(err){
          next(err)
        }
      })
    }
    res.json(deletedUser)
  });
};

//!promoters

// show promoters
adminController.showPromoters = function (req, res) {
  Promoter.find({}).exec((err, dbPromoters) => {
    if (err) {
      next(err);
    } else {
      res.json(dbPromoters);
    }
  });
};
//show specific promoter
adminController.showPromoter = function (req, res) {
  Promoter.findOne({ _id: req.params.id }).exec((err, dbPromoter) => {
    if (err) {
      next(err);
    } else {
      res.json(dbPromoter);
    }
  });
};
//edit promoter
adminController.editPromoter = function (req, res) {
  Admin.findOne({ email: req.body.email }).exec((err, dbAdmin) => {
    if (err) {
      next(err);
    }if(dbAdmin !== null){
      console.log(dbAdmin)
      res.status(500).send({message:"O Admin tem esse email!"});
    }else{
        User.findOne({ email: req.body.email }).exec((err, dbUsers) => {
            if (err) {
              next(err);
            } else {
              if(dbUsers !== null ){
                res.status(500).send({message:"Um promoter já têm esse email"});
              }else{
                Promoter.findOne({ email: req.body.email }).exec((err, dbPromoters) => {
                    if (err) {
                      next(err);
                    } else {
                      if(dbPromoters !== null && dbPromoters._id != req.params.id){
                        res.status(500).send({message:"Um User Já tem esse email"});
                      }else{
                        if(bcrypt.compareSync(req.body.password,dbPromoters.password)){
                          req.body.password= dbPromoters.password;
                        }else{
                          req.body.password= bcrypt.hashSync(req.body.password, 8);
                        }
                        Promoter.findByIdAndUpdate(req.params.id, req.body, (err, editedPromoter) => {
                          if (err) {
                            next(err);
                          } else {
                            res.json(editedPromoter);
                          }
                        });
                      }
                    }
                  });
              }
            }
          })
      }
    }
  )
};
//delete promoter
adminController.deletePromoter = function (req, res) {
  Promoter.remove({ _id: req.params.id }).exec((err, deletedPromoter) => {
    if (err) {
      next(err);
    } else {
      Events.remove({id_Promoter:req.params.id}).exec((err, dbEvents)=>{
        if(err){
          next(err)
        }
          for( var i =0; i<dbEvents.length;i++){
            Tickets.remove({ idEvent: dbEvents[i]._id }).exec((err, deletedEvent) => {
              if (err) {
                next(err);
              } else {
               
              }
            });
          }
        
      })
    }
    res.json(deletedPromoter);
  });
};

// !show Change pass
//Edit password
adminController.EditPassword = function (req, res) {
  var token = req.headers["x-access-token"];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }
    req.adminId = decoded.id;
    req.permission = decoded.permission;
    Admin.findOne({_id:req.adminId}).exec((err,dbAdmin)=>{
      if(req.body.password){
        if(bcrypt.compareSync(req.body.password,dbAdmin.password)){
          req.body.password= dbAdmin.password;
        }else{
          req.body.password= bcrypt.hashSync(req.body.password, 8);
        }
        Admin.findByIdAndUpdate(req.adminId, req.body, (err, editedAdmin) => {
          if (err) {
            next(err);
          } else {
            res.json(editedAdmin);
          }
        });
      }
      
    })
    
  });
};
adminController.getAdmin = function (req, res) {
  var token = req.headers["x-access-token"];
 
  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }
    req.adminId = decoded.id;
    req.permission = decoded.permission;
    Admin.findOne({_id:req.adminId}).exec((err,dbAdmin)=>{
      if(err){
        next(err);
      }else {
        res.json(dbAdmin);
      }
    })
  });
};

module.exports = adminController;
