var mongoose                = require('mongoose'),
    passportLocalMongoose   = require("passport-local-mongoose");

var userSchema = mongoose.Schema({
    username: String,
    password: String
});

//to get all methods from passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);