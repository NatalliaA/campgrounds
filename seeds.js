var mongoose    = require('mongoose'),
    Campground  = require('./models/campground'),
    Comment     = require('./models/comment');
    
var data = [
        {
            name: "River Camp",
            image: "https://www.photosforclass.com/download/pb_939588",
            description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. "
        },
        {
            name: "Mountain Camp",
            image: "https://www.photosforclass.com/download/pb_2512944",
            description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. "
        },
        {
            name: "Forest Camp",
            image: "https://www.photosforclass.com/download/pb_1626412",
            description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. "
        }
    ];

function seedDB(){
    //delete all campgrounds
    Campground.deleteMany({}, function(err){
    if(err)
    {console.log(err);}
    console.log("Remove campgrounds");

    //add a few campgrounds
    data.forEach(function(seed){
    Campground.create(seed, function(err, campground){
        if(err)
        {console.log(err);}
        else
        {
            console.log("added a campground");
            //create a comment
            Comment.create(
                {
                    text: "This place is great!",
                    author: "Homer"
                }, function(err, comment){
                    if(err)
                    {console.log(err);}
                    else
                    {
                        campground.comments.push(comment);
                        campground.save();
                        console.log("Created a new comment");
                    }
                })
        }
        });
    });
});

//add a few comments
}

module.exports = seedDB;