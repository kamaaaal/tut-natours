const express = require('express');
const router = express.Router();

// importing user controller to mount them
authContoller = require('../controllers/authController');

router.route('/signup').post(authContoller.signup);
router.route('/login').post(authContoller.login);

/// exporitng the router
module.exports = router;
