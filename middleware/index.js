// all the middleware goes here
var Campground = require('../models/campground');
var Comment = require('../models/comment');

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    //message
    req.flash('error', 'You need to be logged in to do that.');
    res.redirect('/login');
}

middlewareObj.checkCampgroundOwnership = function(req, res, next){
        //is user logged in
        if(req.isAuthenticated())
        {
                Campground.findById(req.params.id, function(err, foundCampground){
                if(err || !foundCampground)
                {
                    req.flash('error', "Campground not found.")
                    res.redirect('back');
                }
                else
                {
                    //does user own the campground?
                    // don't use this campground.author.id === req.user._id, the left one is actually not a String
                    //even thogh they look the same, use equals instead
                    if(foundCampground.author.id.equals(req.user._id))
                    {next();}
                    else
                    {   //message
                        req.flash('error', 'Sorry, you do not have permission to do that.');
                        //not the campground owner - redirect
                        res.redirect("back");
                    }
                }
            });            
        }
        else
        {
            //if user is not logged in, redirect back where user came from
            //message
            req.flash('error', 'You need to be logged in to do that.');        
            res.redirect("back");
        }   
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    //is user logged in
    if(req.isAuthenticated())
    {
            Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment)
            {
                req.flash('error', 'Comment not found.');
                res.redirect("back");
            }
            else
            {   //user owns the comment
                // don't use this foundComment.author.id === req.user._id, the left one is actually not a String
                //even though they look the same, use equals instead
                if(foundComment.author.id.equals(req.user._id))
                {next();}
                else
                {  //not the campground owner - message and redirect
                    req.flash('error', 'Sorry, you do not have permission to do that.');
                    res.redirect("back");
                }
            }
        });            
    }
    else
    {
        //if user is not logged in, redirect back where user came from 
        req.flash('error', 'Please login first.');       
        res.redirect("back");
    } 
}

module.exports = middlewareObj;