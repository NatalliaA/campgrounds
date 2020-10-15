var express = require('express');
var campground = require('../models/campground');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware');
//for hiding api key/secret
require('dotenv').config();

//for image upload
var multer = require('multer');
var storage = multer.diskStorage({
    //create a custom name
  filename: function(req, file, callback) {  
      callback(null, Date.now() + file.originalname);
  }
});

//The function should call `cb` with a boolean
// to indicate if the file should be accepted
/* var imageFilter = function(req, file, cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
        console.log('Only image files are allowed!');
        return cb('ERROR: Only .png, .jpg and .jpeg format allowed!'); 
     }        
        cb(null, true);
    }; */

//var upload = multer({ storage: storage, fileFilter: imageFilter});

var upload = multer({ storage: storage}).single('image');

var cloudinary = require('cloudinary');
const { register } = require('../models/user');
cloudinary.config({ 
  cloud_name: 'addedpictures', 
  api_key: process.env.CLOUDINARY_API_KEY,  
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//replace app variable with router 

//CAMPGROUNDS ROUTES
//INDEX - show all campgrounds
router.get("/", function(req, res){

    //get all campgrounds from db
    Campground.find({}, function (err, allcampgrounds){
       if(err){
           console.log("Error: " + err.message);
       }
       else
       {//add found campgrounds in db to the page "campgrounds"
           res.render("campgrounds/index", {campgrounds: allcampgrounds, currentUser: req.user});
       }
})
});

//NEW - show form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
      res.render('campgrounds/new'); 
});

//CREATE - add a new campground to DB
router.post("/", middleware.isLoggedIn, upload, function(req, res) {

if(!req.file.originalname.match(/\.(jpg|jpeg|png)$/i))
{
    var newCamp = req.body.campground;  
     res.render('campgrounds/new', 
    {
        campground: newCamp,
        error: 'Only .png, .jpg and .jpeg image format allowed!'        
    } );      
}
else
{
    //takes req.file.path, returns result
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err)
        {
            req.flash('error', err.message);
            return res.redirect('/campgrounds/' + campground.id);
        }
      // add cloudinary url for the image to the campground object under image property
      //secure_url,public_id come from cloudinary API 
      req.body.campground.image = result.secure_url;
      //add image's public_id to campground object
      req.body.campground.imageId = result.public_id;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
    }
});

//SHOW - show info about a cprecific campground
//make show it is after campgrounds/new otherwise new can be read as id
router.get("/:id", function(req, res){
   //find the campground with provided id
   //populate - add comments' content and autor to the campground
   Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if(err || !foundCampground)
           {
                req.flash('error', 'Campground not found.');
                res.redirect('back');
            }
       else
       {
           console.log("Found Campground: " + foundCampground);
            //render show template with that campground
           res.render("campgrounds/show", {campground: foundCampground});
       }
   });   
});

//EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res){
    
    //if user is campground's owneer open edit form
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err)
            {   //did not found campground
                req.flash('error', 'Campground not found.');
            }
            else
            {//found campground
            res.render('campgrounds/edit', {campground: foundCampground});}               
        });        
});

//UPDATE CAMPGROUND ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, upload, function(req, res){   
        //find the correct campground
        Campground.findById(req.params.id, async function(err, campground){
         if(err)
            {   
            req.flash('error', err.message);
            res.redirect('/campgrounds');
            }
        else
            {   //check if req.file exists: user uploads a new image for this campground
                if(req.file)
                {
                    //check image file format
                    if(!req.file.originalname.match(/\.(jpg|jpeg|png)$/i))
                    {
                       req.flash('error', 'Only .png, .jpg and .jpeg image format allowed!');
                        return res.redirect('back');      
                     }

                    try{
                        //delete the previos image from cloudinary
                        //await means wait untill destroy finishes and then goe to next line
                        //by default in Javascript or Node.js all callbacks are synchronous
                        await cloudinary.v2.uploader.destroy(campground.imageId);                                             
                        //upload a new image
                        var result = await  cloudinary.v2.uploader.upload(req.file.path);                        
                        //take the result and pull a new url for image
                        campground.imageId = result.public_id;
                        campground.image = result.secure_url;
                    }
                    catch(err)
                    {
                        req.flash('error', err.message);
                        return res.redirect('/campgrounds');
                    }             
                }
                           
                //update other campground's info
                 campground.name = req.body.campground.name;
                 campground.price = req.body.campground.price;
                 campground.description = req.body.campground.description;
                 //save in db
                 campground.save();

                // redirect to campground's show page    
                req.flash('success', 'Successfully updated!');    
                res.redirect('/campgrounds/' + req.params.id);
            }
            });    
    });


//DESTROY CAMPGROUND ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err)
        {   req.flash('error', err.message);
            return res.redirect("back");
        }
        
        try
          {//delete image from cloudinary
            await cloudinary.v2.uploader.destroy(campground.imageId);    
            //delete campground from db
            campground.remove();
            req.flash('success', "Post deleted.");
            res.redirect("/campgrounds");
          }
        catch(err)
          {  req.flash('error', err.message);
          return res.redirect("back");}
    });
});

module.exports = router;