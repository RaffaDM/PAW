var express = require('express');
const authController = require('../controllers/authController');
var router = express.Router();
var promoterController = require('../controllers/promoterController');


router.get('/showAll',authController.verifyPromoter,promoterController.showAllEvents);
router.get('/showMy',authController.verifyPromoter,promoterController.showMyEvents);
router.post('/createEvent', authController.verifyPromoter,promoterController.create);
router.get('/event/:id', authController.verifyPromoter,promoterController.showEvent);
router.put('/event/:id', authController.verifyPromoter,promoterController.editEvent);
router.delete('/event/:id', authController.verifyPromoter,promoterController.deleteEvent)
router.get('/eventsAct',authController.verifyPromoter,promoterController.showEventAct);
router.get('/profile',authController.verifyPromoter,promoterController.profile)
router.put('/profile',authController.verifyPromoter,promoterController.editProfile)

module.exports = router;