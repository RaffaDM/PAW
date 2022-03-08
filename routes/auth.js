var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController');


router.get('/', function (req, res, next) {
    res.send("This is the Home page, have a good day!");
});  
router.post('/login', authController.findAccount);
router.post('/register', authController.create );
router.get('/logout', authController.logout );

module.exports = router;
