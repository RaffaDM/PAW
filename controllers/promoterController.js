var mongoose = require("mongoose");
var Promoter = require("../models/promoter");
var Event = require("../models/events");
const jwt = require("jsonwebtoken");
const config = require("../jwt_secret/config");
const { NotExtended } = require("http-errors");
var bcrypt = require("bcrypt");
var Tickets = require("../models/tickets");

var promoterController = {};

// Show all Events
promoterController.showAllEvents = function (req, res) {
  Event.find({ activate: true }).exec((err, dbEvents) => {
    if (err) {
      next(err);
    } else {
      res.json(dbEvents);
    }
  });
};

promoterController.showMyEvents = function (req, res) {
  var token = req.headers["x-access-token"];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }

    req.promoterId = decoded.id;
    Event.find({ id_Promoter: req.promoterId }).exec((err, dbEvents) => {
      if (err) {
        next(err);
      } else {
        res.json(dbEvents);
      }
    });
  });
};
//show specific event
promoterController.showEvent = function (req, res) {
  Event.findOne({ _id: req.params.id }).exec((err, dbEvent) => {
    if (err) {
      next(err);
    } else {
      res.json(dbEvent);
    }
  });
};
//Show all events that are activated
promoterController.showEventAct = function (req, res) {
  var token = req.headers["x-access-token"];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }

    req.promoterId = decoded.id;
    Event.find({ activate: true, id_Promoter: req.promoterId }).exec(
      (err, dbEvents) => {
        if (err) {
          next(err);
        } else {
          res.json(dbEvents);
        }
      }
    );
  });
};
//Create event
promoterController.create = function (req, res) {
  var token = req.headers["x-access-token"];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }

    req.body.id_Promoter = decoded.id;
    var event = new Event(req.body);
    event.save((err, dbEvent) => {
      if (err) {
        next(err);
      } else {
        res.json(dbEvent);
      }
    });
  });
};

//delete event
promoterController.deleteEvent = function (req, res) {
  var token = req.headers["x-access-token"];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }
    Event.findOne({ _id: req.params.id }).exec((err, dbEvent) => {
      if (err) {
        next(err);
      } else {
        if (dbEvent) {
          if (dbEvent.id_Promoter == decoded.id) {
            Event.remove({ _id: req.params.id }).exec((err, deletedEvent) => {
              if (err) {
                next(err);
              } else {
                Tickets.remove({ idEvent: req.params.id }).exec((err, deletedTickets)=>{
                  if (err) {
                    next(err);
                  }
                })
                res.json(deletedEvent);
              }
            });
          } else {
            res
              .status(203)
              .send({ message: "Not authorized to delete this event!" });
          }
        } else {
          res.status(500).send({ message: "Internal Error" });
        }
      }
    });
  });
};
//edit event
promoterController.editEvent = function (req, res) {
  var token = req.headers["x-access-token"];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }

    if (req.params.id.length != 24) {
      return res.status(404).send({ message: "Not found" });
    }
    Event.findOne({ _id: req.params.id }).exec((err, dbEvent) => {
      if (err) {
        res.status(500).send({ message: "Internal Error" });
      } else {
        if (dbEvent) {
          if (dbEvent.id_Promoter == decoded.id) {
            Event.findByIdAndUpdate(
              req.params.id,
              req.body,
              (err, editedEvent) => {
                if (err) {
                  next(err);
                } else {
                  res.json(editedEvent);
                }
              }
            );
          } else {
            res
              .status(203)
              .send({ message: "Not authorized to edit this event!" });
          }
        } else {
          res.status(404).send({ message: "Not found" });
        }
      }
    });
  });
};
promoterController.showEventAct = function (req, res) {
  var token = req.headers["x-access-token"];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }

    req.promoterId = decoded.id;
    Event.find({ activate: true, id_Promoter: req.promoterId }).exec(
      (err, dbEvents) => {
        if (err) {
          next(err);
        } else {
          res.json(dbEvents);
        }
      }
    );
  });
};
promoterController.profile = function (req, res) {
  var token = req.headers["x-access-token"];

  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }

    req.promoterId = decoded.id;
    Promoter.findOne({ _id: req.promoterId }).exec((err, dbPromoter) => {
      if (err) {
        next(err);
      } else {
        res.json(dbPromoter);
      }
    });
  });
};

promoterController.editProfile = function (req, res) {
  var token = req.headers["x-access-token"];
  jwt.verify(token, config.secret, function (err, decoded) {
    if (err) {
      return res.status(500).send({ auth: false, message: "Internal Error" });
    }

    req.promoterId = decoded.id;

    Promoter.findOne({ _id: req.promoterId }).exec((err, dbPromoter) => {
      if (req.body.password) {
        if (bcrypt.compareSync(req.body.password, dbPromoter.password)) {
          req.body.password = dbPromoter.password;
        } else {
          req.body.password = bcrypt.hashSync(req.body.password, 8);
        }
        Promoter.findByIdAndUpdate(
          req.promoterId,
          req.body,
          (err, editedPromoter) => {
            if (err) {
              next(err);
            } else {
              res.json(editedPromoter);
            }
          }
        );
      }
    });
  });
};
module.exports = promoterController;
