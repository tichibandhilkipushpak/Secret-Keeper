require('dotenv').config();
const express=require('express');
const bodyparser=require('body-parser');
const ejs=require('ejs');
const mongoose=require('mongoose');
const session=require('express-session');
const passport=require('passport');
const pasportlocalmongoose=require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate=require('mongoose-findorcreate');


const app= express();

//What we are telling our app to use thhis.

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));

//Tell us to use session
app.use(session({
    secret:process.env.SECRET,
    //Setting them to false helps us to get rid of multiple parallel request.
    resave: false,
    saveUninitialized: false

}));

//Tell our app to use passport
app.use(passport.initialize());
app.use(passport.session());




//Connection
const url=process.env.MONGODBURL;
mongoose.connect(url,{ useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

const userschema=new mongoose.Schema({
    email:String,
    password:String,
    googleId:String,
    secret:String

});

userschema.plugin(findOrCreate);
userschema.plugin(pasportlocalmongoose);

//locking our schema
const user=new mongoose.model('user',userschema);

//Using passport local mongoose
passport.use(user.createStrategy());

passport.serializeUser(function(newuser, done) {
    done(null, newuser.id);
  });
  
  passport.deserializeUser(function(id, done) {
    user.findById(id, function(err, newuser) {
      done(err, newuser);
    });
  });
// Enivronment Variables
// const API_KEY=process.env.API_KEY;
// const secret=process.env.SECRET;


// This all works on the schema we are just extending the power of schema.
// userschema.plugin(encrypt,{secret:secret,encryptedFields:['password']});

//Work with server.


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
  },
  function(accessToken, refreshToken, profile, cb) {
    user.findOrCreate({ googleId: profile.id }, function (err, newuser) {
      return cb(err, newuser);
    });
  }
));



//Routes
app.get('/',function(req,res){
    res.render('home');
})

app.get('/login',function(req,res){
    res.render('login');
})
app.get('/register',function(req,res){
    res.render('register');
})
//Always check if the resuest is authenticated or not.
app.get('/secrets',function(req,res){

    user.find({"secret":{$ne:null}},function(err,foundusers){
        if(err)
        console.log(err);
        else{
            res.render("secrets",{users:foundusers});
        }
    })

})

app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
})

app.get("/auth/google",
  passport.authenticate('google', { scope: ['profile'] })
);

app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
 //Successful authentication, redirect home.
    res.redirect('/secrets');
})

app.get("/submit",function(req,res){
    if(req.isAuthenticated())
    res.render('submit');
    else
    res.redirect('/login');
})

app.post("/submit",function(req,res){
    const newsecret=req.body.secret;
    user.findById(req.user.id,function(err,finduser){
        if(err)
        console.log(err);
        else{
            finduser.secret=newsecret;
            console.log(finduser);
            finduser.save(function(err){
                if(!err){
                    res.redirect('/secrets');
                }
            })

        }
        
    })

})
app.post('/register',function(req,res){
    // let username=req.body.username;
    // let password=req.body.password;
    // console.log(username);
    // console.log(password);
    user.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            //that measn they are authenticated cookie saves a currnt logged in session
            passport.authenticate("local")(req,res,function(){
                //if they re logged in then they can simply go to the page that they request.
                res.redirect('/secrets');
            })
        }
    })


 
})

app.post('/login',function(req,res){
    let username=req.body.username;
    let password=req.body.password;
    let newuser=new user({username:username,password:password});
    req.login(newuser,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect('/secrets');
            })
        }
    })
})
app.listen(3000,function(){
    console.log('Started');
})




require('dotenv').config();
const express=require('express');
const bodyparser=require('body-parser');
const ejs=require('ejs');
const mongoose=require('mongoose');
const session=require('express-session');
const passport=require('passport');
const pasportlocalmongoose=require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate=require('mongoose-findorcreate');


const app= express();

//What we are telling our app to use thhis.

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));

//Tell us to use session
app.use(session({
    secret:process.env.SECRET,
    //Setting them to false helps us to get rid of multiple parallel request.
    resave: false,
    saveUninitialized: false

}));

//Tell our app to use passport
app.use(passport.initialize());
app.use(passport.session());




//Connection
const url=process.env.MONGODBURL;
mongoose.connect(url,{ useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

const userschema=new mongoose.Schema({
    email:String,
    password:String,
    googleId:String,
    secret:String

});

userschema.plugin(findOrCreate);
userschema.plugin(pasportlocalmongoose);

//locking our schema
const user=new mongoose.model('user',userschema);

//Using passport local mongoose
passport.use(user.createStrategy());

passport.serializeUser(function(newuser, done) {
    done(null, newuser.id);
  });
  
  passport.deserializeUser(function(id, done) {
    user.findById(id, function(err, newuser) {
      done(err, newuser);
    });
  });
// Enivronment Variables
// const API_KEY=process.env.API_KEY;
// const secret=process.env.SECRET;


// This all works on the schema we are just extending the power of schema.
// userschema.plugin(encrypt,{secret:secret,encryptedFields:['password']});

//Work with server.


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
  },
  function(accessToken, refreshToken, profile, cb) {
    user.findOrCreate({ googleId: profile.id }, function (err, newuser) {
      return cb(err, newuser);
    });
  }
));



//Routes
app.get('/',function(req,res){
    res.render('home');
})

app.get('/login',function(req,res){
    res.render('login');
})
app.get('/register',function(req,res){
    res.render('register');
})
//Always check if the resuest is authenticated or not.
app.get('/secrets',function(req,res){

    user.find({"secret":{$ne:null}},function(err,foundusers){
        if(err)
        console.log(err);
        else{
            res.render("secrets",{users:foundusers});
        }
    })

})

app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/');
})

app.get("/auth/google",
  passport.authenticate('google', { scope: ['profile'] })
);

app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
 //Successful authentication, redirect home.
    res.redirect('/secrets');
})

app.get("/submit",function(req,res){
    if(req.isAuthenticated())
    res.render('submit');
    else
    res.redirect('/login');
})

app.post("/submit",function(req,res){
    const newsecret=req.body.secret;
    user.findById(req.user.id,function(err,finduser){
        if(err)
        console.log(err);
        else{
            finduser.secret=newsecret;
            console.log(finduser);
            finduser.save(function(err){
                if(!err){
                    res.redirect('/secrets');
                }
            })

        }
        
    })

})
app.post('/register',function(req,res){
    // let username=req.body.username;
    // let password=req.body.password;
    // console.log(username);
    // console.log(password);
    user.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            //that measn they are authenticated cookie saves a currnt logged in session
            passport.authenticate("local")(req,res,function(){
                //if they re logged in then they can simply go to the page that they request.
                res.redirect('/secrets');
            })
        }
    })


 
})

app.post('/login',function(req,res){
    let username=req.body.username;
    let password=req.body.password;
    let newuser=new user({username:username,password:password});
    req.login(newuser,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect('/secrets');
            })
        }
    })
})
app.listen(3000,function(){
    console.log('Started');
})


