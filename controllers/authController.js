var mongoose = require("mongoose");
var Admin = require("../models/admin");
var Promoter = require("../models/promoter");
var User = require("../models/user");
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../jwt_secret/config');


var authController = {};

//!Login
authController.findAccount = function (req, res,next) {
    Admin.findOne({ email: req.body.email }).exec((err, dbAdmin) => {
    if (err) {
      next(err);
    } else {
      if(dbAdmin != null && bcrypt.compareSync(req.body.password,dbAdmin.password) ){
        console.log("És um Admin")
        var token = jwt.sign({ id: dbAdmin._id ,permission: dbAdmin.permission}, config.secret, {
          expiresIn: 86400,
        });
        res.status(200).send({ auth: true, token: token ,permission :1});
       
      }else{
        Promoter.findOne({ email: req.body.email }).exec((err, dbPromoters) => {
            if (err) {
              next(err);
            } else {
              if(dbPromoters != null && bcrypt.compareSync(req.body.password,dbPromoters.password)){
                if(dbPromoters.suspended == true){
                  return res.status(404).send({message:'You are suspended!!! Contact the Admin.'});
                }
                console.log("És um Promoter")
                var token = jwt.sign({ id: dbPromoters._id ,permission: dbPromoters.permission}, config.secret, {
                  expiresIn: 86400,
                });
                res.status(200).send({ auth: true, token: token ,permission :2});
              }else{
                User.findOne({ email: req.body.email }).exec((err, dbUsers) => {
                    if (err) {
                      next(err);
                    } else {
                     
                      if(dbUsers != null && bcrypt.compareSync(req.body.password,dbUsers.password)){
                        console.log("És um User")
                        if(dbUsers.suspended == true){
                          return res.status(404).send({message:'You are suspended!!! Contact the Admin.'});
                        }
                        var token = jwt.sign({ id: dbUsers._id ,permission: dbUsers.permission}, config.secret, {
                          expiresIn: 86400,
                        });
                        res.status(200).send({ auth: true, token: token ,permission:3});
                      }else{
                        return res.status(404).send('No User or Promoter found');
                      }
                    }
                  });
              }
            }
          })
      }
    }
  });
};

authController.verifyAdmin = function(req,res,next){
  var token= req.headers['x-access-token'];
  if(!token){
    return res.status(403).send({auth:false,message:'No token provided.'});
  }

  jwt.verify(token,config.secret,function(err,decoded){
    if(err){
      return res.status(500).send({auth:false, message:'Internal Error'})
    }
    if(decoded.permission == 1){
      req.adminId = decoded.id;
      req.permission = decoded.permission;
      next();
    }else{
      return res.status(203).send({auth:false, message:'Fail to authenticate token'})
    }
    
  })
}
authController.verifyPromoter = function(req,res,next){
  var token= req.headers['x-access-token'];
  if(!token){
    return res.status(403).send({auth:false,message:'No token provided.'});
  }

  jwt.verify(token,config.secret,function(err,decoded){
    if(err){
      return res.status(500).send({auth:false, message:'Internal Error'})
    }
    if(decoded.permission == 2){
      req.adminId = decoded.id;
      req.permission = decoded.permission;
      next();
    }else{
      return res.status(203).send({auth:false, message:'Fail to authenticate token'})
    }
    
  })
}
authController.verifyUser = function(req,res,next){
  var token= req.headers['x-access-token'];
  if(!token){
    return res.status(403).send({auth:false,message:'No token provided.'});
  }

  jwt.verify(token,config.secret,function(err,decoded){
    if(err){
      return res.status(500).send({auth:false, message:'Internal Error'})
    }
    if(decoded.permission == 3){
      req.adminId = decoded.id;
      req.permission = decoded.permission;
      next();
    }else{
      return res.status(203).send({auth:false, message:'Fail to authenticate token'})
    }
    
  })
}


authController.logout = function (req, res) {
  res.status(200).send({ auth: false, token: null });
}

//!Register
authController.create = function (req, res) {
  var promoter = new Promoter(req.body);
  promoter.nEvents = 0;
  var user = new User(req.body);
  user.nCancel=0;
  user.suspended=false;
  user.timeStamp= new Date();
  user.password = bcrypt.hashSync(req.body.password, 8);
  promoter.password = bcrypt.hashSync(req.body.password, 8);
  //!Promoter find email
  Promoter.findOne({ email: req.body.email }).exec((err, dbPromoters) => {
    if (err) {
      next(err);
    } else {
      //!if Promoter doesn't exist
      if (dbPromoters === null) {
        //!User find email
        User.findOne({ email: req.body.email }).exec((err, dbUsers) => {
          if (err) {
            return res.status(500).send('Error on the server.');
          } else {
            //!If User doesn't Exist
            if (dbUsers === null) {
              if (req.body.permission == 2) {
                promoter.save((err) => {
                  if (err) {
                    return res.status(500).send('Error on the server.');
                  } else {
                    res.json(req.body);
                  }
                });
              } else if (req.body.permission == 3) {
                user.save((err) => {
                  if (err) {
                    return res.status(500).send('Error on the server.');
                  } else {
                    res.json(req.body);
                  }
                });
              }
            } else {
              console.log("User Already Exist");
              res.json({});
            }
          }
        });
      } else {
        console.log("Promoter Already exists");
        res.json({});
      }
    }
  });
};

module.exports = authController;
