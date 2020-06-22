var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
 var PlaceSchema = new mongoose.Schema({
     name: String,
     image: String,
     description: String,
 });

PlaceSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("BPlace", PlaceSchema);
