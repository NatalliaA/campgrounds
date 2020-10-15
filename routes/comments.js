var express = require('express');
const campground = require('../models/campground');
var router = express.Router({mergeParams: true});
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');

//replace app variable with router 

//========================
//COMMENTS ROUTES
//========================
//NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
    //find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err)
        {console.log(err);}
        else
        {res.render("comments/new", {campground: campground});}
    });    
});

//CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup campground using ID
    Campground.findById(req.params.id, function(err, campground){
        if(err)
        { console.log(err);
        res.redirect('/campgrounds');}
        else
        {
            //create a new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err)
                {   //something wrong with db or data
                    req.flash('error', 'Something went wrong.')
                    console.log(err);
                }
                else
                {  
                    //connect new comment to campground
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;                   
                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash('success', 'Successfully added your comment.');
                    console.log("COMMENT: " + comment);                    
                    //redirect back to campground's show page
                    res.redirect("/campgrounds/" + campground._id);   
                }
            });
        }
    });
});

//EDIT
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res){    
    //if someone change campground id in the browser, prevent from breaking the app
    Campground.findById(req.params.id, function(err, foundCampground){
        if (err || !foundCampground)
        {
            req.flash('error', 'Campground not found.');
            return res.redirect('back');
        }

        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment)
            {   req.flash('error', 'Comment not found.');
                res.redirect('back');
            }
            else
            { //req.params.id - id is campground's id
            //comment_id - id of the comment
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        }); 
    })
    });

//UPDATE
router.put('/:comment_id', middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err)
        {res.redirect('back');}
        else
        {res.redirect('/campgrounds/' + req.params.id);}
    });    
});

//DESTROY
router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err)
        {res.redirect('back');}
        else
        {   req.flash('success', "Comment deleted.");
            res.redirect('/campgrounds/' + req.params.id);}
    });
});

module.exports = router;