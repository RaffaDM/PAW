var express = require('express');
const authController = require('../controllers/authController');
var router = express.Router();
var userController= require('../controllers/userController');


router.get('/events',authController.verifyUser,userController.showEvents);
router.get('/showEvent/:id',authController.verifyUser,userController.showEvent);
router.get('/myTickets',authController.verifyUser,userController.myTickets);
router.post('/buyTicket/:id',authController.verifyUser,userController.buyTicket);
router.delete('/cancelTicket/:id',authController.verifyUser,userController.cancelTicket);
router.get('/profile',authController.verifyUser,userController.profile)
router.put('/profile',authController.verifyUser,userController.editProfile)
module.exports = router;

