const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const userController = require('../controllers/user');
const { storeReturnTo } = require('../middleware');

// (get) show register form
// (post) register the user
router.route('/register')
.get(userController.showRegisterForm)
.post(catchAsync(userController.registerUser));

// (get) show login form
// (post) submit login req & auth
router.route('/login')
.get(userController.showLoginForm)
.post(
    storeReturnTo,
    passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),
    userController.postLogin
    );

//logout the user
router.get('/logout',userController.logoutUser);

module.exports = router;