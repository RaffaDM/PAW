var mongoose = require("mongoose");
var User = require("../models/user");
var Ticket = require("../models/tickets");
var Event = require("../models/events");
const jwt = require("jsonwebtoken");
const config = require("../jwt_secret/config");
const PERCENTAGEM_LOTACAO = 0.3;
var events = [];
var userController = {};
var bcrypt = require("bcrypt");

//show all events
userController.showEvents = function (req, res) {
  Event.find({ activate: true }).exec((err, dbEvents) => {
    if (err) {
      next(err);
    } else {
      res.json(dbEvents);
    }
  });
};

userController.myTickets = function (req, res) {
  var token = req.headers["x-access-token"];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }
    req.userId = decoded.id;
    User.findOne({ _id: req.userId }).exec((err, dbUsers) => {
      if (err) {
        next(err);
      } else {
        Ticket.find({ idUser: dbUsers._id }).exec((err, dbTickets) => {
          if (err) {
            next(err);
          } else {
            events = [];
            function delay(ms) {
              for (let i = 0; i < dbTickets.length; i++) {
                Event.findOne({ _id: dbTickets[i].idEvent }).exec(
                  (err, dbEvents) => {
                    if (err) {
                      next(err);
                    } else {
                      events.push(dbEvents);
                    }
                  }
                );
              }
              return new Promise((resolve) => setTimeout(resolve, ms));
            }

            delay(2000).then(() => res.json(events));
          }
        });
      }
    });
  });
};

//show specific event
userController.showEvent = function (req, res) {
  Event.findOne({ _id: req.params.id }).exec((err, dbEvents) => {
    if (err) {
      next(err);
    } else {
      res.json(dbEvents);
    }
  });
};

//Buy a ticket
userController.buyTicket = function (req, res) {
  var token = req.headers["x-access-token"];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }
    req.userId = decoded.id;
    if (req.params.id.length != 24) {
      return res.status(404).send({ message: "Not found" });
    }
    Event.findOne({ _id: req.params.id }).exec((err, dbEvents) => {
      if (err) {
        console.log(err);
        next(err);
      } else {
        console.log(dbEvents);
        if (!dbEvents) {
          return res.status(404).send({ message: "Not found" });
        }
        if (
          dbEvents.current ==
          dbEvents.capacity - (dbEvents.capacity * PERCENTAGEM_LOTACAO)
        ) {
          return res.status(203).send({ message: "Lotação cheia!" });
        }
        User.findOne({ _id: req.userId }).exec((err, dbUsers) => {
          if (err) {
            next(err);
          } else {
            var ticket = new Ticket({
              idUser: req.userId,
              idEvent: dbEvents._id,
            });
            Ticket.findOne({idEvent:req.params.id, idUser:req.userId}).exec((err,tickets)=>{
              if(err){
                next(err);
              }else{
                if(!tickets){
                  ticket.save((err) => {
                    if (err) {
                      next(err);
                    }
                    dbEvents.current++;
                    Event.findByIdAndUpdate(dbEvents._id,dbEvents).exec((err, dbEventsUpdate) => {
                      if (err) {
                        next(err);
                      } else {
                        res.json(ticket);
                      }
                    });
                    
                  });
                }else{
                  res.status(405).send({message:"Já Existe"})
                }
              }
            })
           
          }
        });
      }
    });
  });
};

//Cancel a ticket
userController.cancelTicket = function (req, res) {
  
  var token = req.headers["x-access-token"];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }
    req.userId = decoded.id;
    Ticket.findOne({ idUser: req.userId, idEvent: req.params.id }).exec((err,dbTicket)=>{
      if(err){
        next(err);
      }
      if(dbTicket){
        User.findOne({ _id: req.userId }).exec((err,dbUsers)=>{
          Ticket.remove({ _id:dbTicket._id }).exec((err, removedTicket) => {
            if (err) {
              next(err);
            } else {
              switch (dbUsers.nCancel) {
                case 0:
                  dbUsers.timeStamp = new Date();
                  dbUsers.nCancel=dbUsers.nCancel+1;
                  break;
                case 4:
                  if (
                    (dbUsers.timeStamp.getTime() - new Date().getTime()) /
                      (1000 * 3600 * 24) <=
                    31
                  ) {
                    dbUsers.suspended = true;
                    dbUsers.nCancel=dbUsers.nCancel+1;
                  
                  } else {
                    dbUsers.nCancel = 1;
                    dbUsers.timeStamp = new Date();
                  }
                  break;
                default:
                  dbUsers.nCancel=dbUsers.nCancel+1;
              }
              Event.findOne({_id:req.params.id}).exec((err, dbEvents) => {
                if (err) {
                  next(err);
                } else {
                  dbEvents.current--;
                  Event.findByIdAndUpdate(dbEvents._id,dbEvents).exec((err, dbEventsUpdate) => {
                    if (err) {
                      next(err);
                    } else {
                      User.findByIdAndUpdate(dbUsers._id, dbUsers, (err, editedUser) => {
                        if (err) {
                          next(err);
                        } else {
                          res.json(removedTicket);
                        }
                      });
                    }
                  });
                }
              });
             
             
            }
          }
        );
        })
      }else{
        res.status(404).send({message:"Not found"})
      }
    })
  });
};

userController.profile = function (req, res) {
  var token = req.headers["x-access-token"];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }

    req.userId = decoded.id;
    User.findOne({_id:req.userId}).exec((err, dbUser) => {
      if (err) {
        next(err);
      } else {
        res.json(dbUser);
      }
    });
  });
};
userController.editProfile =function(req,res){
  var token = req.headers["x-access-token"];
 
  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }
 
    req.userId = decoded.id;
    
    
    User.findOne({_id:req.userId}).exec((err,dbUser)=>{
      if(req.body.password){
        if(bcrypt.compareSync(req.body.password,dbUser.password)){
          req.body.password= dbUser.password;
        }else{
          req.body.password= bcrypt.hashSync(req.body.password, 8);
        }
        User.findByIdAndUpdate(req.userId, req.body, (err, editedUser) => {
          if (err) {
            next(err);
          } else {
            res.json(editedUser);
          }
        });
      }
    })
    }
  );
  
}
module.exports = userController;
