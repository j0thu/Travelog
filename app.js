var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport');
var mongoose = require('mongoose');
var LocalStrategy = require('passport-local');
var User = require('./models/user');
var VPlace = require('./models/visited');
var BPlace = require('./models/bucket');
const dotenv = require('dotenv').config()


mongoose
.connect(process.env.MONGODB_URI, 
{   
    dbName: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    useNewUrlParser:true,
    useUnifiedTopology:true
});

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+'/public'));

//Passport config
app.use(require('express-session')({
    secret: 'Travelsecret',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    res.redirect("/reglog");
});
//Registration and login page
app.get("/reglog", function(req, res){
    res.render('reglog');
});

//Registering logic
app.post("/reglog/register", function(req, res){
    var newUser = new User ({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('reglog-error');
        }
        passport.authenticate('local')(req, res, function(){
        res.redirect('/places');
        })
    })
});

//Login Logic
app.post("/reglog/login", passport.authenticate('local', {
    successRedirect: '/places',
    failureRedirect: '/'
}),function(req,res){
});

//Logout Logic
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/reglog');
});

//places - Home Page - visited
app.get('/places', isLoggedIn, function(req, res){
   VPlace.find({},function(err, allPlaces){
       if(err){
           console.log(err);
       }
       else{
           res.render('home', {places: allPlaces});
       }
   })
})

//places-Home Page - bucket
app.get('/places/bucket', isLoggedIn, function(req, res){
    BPlace.find({}, function(err, allPlaces){
        if(err){
            console.log(err);
        }
        else{
            res.render('home', {places: allPlaces});
        }
    })
    })
    
//Add place logic
app.post('/places',isLoggedIn,  function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    if(req.body.visited){
        var newPlace = {name:name, image:image};
        VPlace.create(newPlace, function(err, newlycreated){
            if(err){
                console.log(err);
            }
            else{
                res.redirect('/places');
            }
        })
    } else{
        var newPlace = {name: name, image:image};
        BPlace.create(newPlace, function(err, newlycreated){
            if(err){
                console.log(err);
            }
            else{
                res.redirect('/places/bucket');
            }
        })
    }
});

//Add place form
app.get('/places/add', function(req, res){
    res.render('addplace');
})


function isLoggedIn(req, res, next){
if(req.isAuthenticated()){
    return next();
}
res.redirect('/login');
}

//server

const PORT = process.env.PORT || 5550

app.listen(PORT, function(){
    console.log('Server running on port ' + PORT);
})
