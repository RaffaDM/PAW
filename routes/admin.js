var express = require('express');
var router = express.Router();
var adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');


//!Criar User ou Promoter
router.post('/create', authController.verifyAdmin,adminController.create);
//!User
router.get('/users', authController.verifyAdmin,adminController.showUsers);
router.get('/user/:id', authController.verifyAdmin,adminController.showUser);
router.put('/user/:id', authController.verifyAdmin,adminController.editUser);
router.delete('/user/:id', authController.verifyAdmin,adminController.deleteUser)
//!Promoter
router.get('/promoters', authController.verifyAdmin,adminController.showPromoters);
router.get('/promoter/:id', authController.verifyAdmin,adminController.showPromoter);
router.put('/promoter/:id', authController.verifyAdmin,adminController.editPromoter);
router.delete('/promoter/:id', authController.verifyAdmin,adminController.deletePromoter);
//!ChangePass
router.put('/changePass', authController.verifyAdmin,adminController.EditPassword );
router.get('/getAdmin',authController.verifyAdmin,adminController.getAdmin)
module.exports = router;

