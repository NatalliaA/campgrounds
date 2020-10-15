var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

//replace app variable with router 

//=================
//ROUTES
//=================

//ROOT ROUTE - landing page
router.get("/", function(req, res){
    res.render("landing");
});   

//======================
// AUTH ROUTES
//=====================    

//REGISTER/SIGN UP ROUTE

//Show sign up form
router.get('/register', function(req, res){
    res.render('register');
});  
//handle sign up logic
router.post('/register', function(req, res){
       var newUser = new User({username: req.body.username});
        User.register(newUser, req.body.password, function(err, user){
        if(err)
        {
            //err.message from passport package, displays corresponding error message 
            //flash with render: error message goes directly as the second argument
            return res.render('register', {error: err.message});                                
        }        
            passport.authenticate('local')(req, res, function(){
            req.flash('success', 'Welcome to YelpCamp ' + user.username + '!');
            res.redirect('/campgrounds');
            });        
    });
});

//LOGIN ROUTE

//show login form
router.get('/login', function(req, res){
    res.render('login');
});
//handle login logic
//2nd parameter is a middleware, which calls passport.use(new LocalStrategy(User.authenticate()));
//3d parameter is a callback that doesn't do anything, we just keep it to show 
//that the 2nd parameter is in the middle (middleware)
router.post('/login', passport.authenticate('local', 
    {
        successRedirect: '/campgrounds',
        failureRedirect: '/login',
        failureFlash: true

    }), function(req, res){    
});

//LOGOUT ROUTE

router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', "Logged you out!")
    res.redirect('/campgrounds');
});

module.exports = router;