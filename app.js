// Refer to https://claudiajs.com/tutorials/servclauerless-express.html for deplyment commands
// run this after making changes to update: claudia update --set-env-from-json prod-env.json

require('dotenv').config();
const express = require('express');
const app = express();
const router = express.Router();
const CiscoSpark = require(`ciscospark`);
const assert = require(`assert`);

var passport = require('passport'),
    CiscoSparkStrategy = require('passport-cisco-spark').Strategy;
var _ = require('lodash'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    url = require ('url'),
    util = require('util');
    
var theme_folder = "theme-webuild";
console.log("here's the " + __dirname);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
//app.set('views', __dirname + '/views/' + theme_folder);
app.use(logger('combined'));
/* Sample default routes for app
app.get('/', (req, res) => res.send('Hello Lambda world - you are too much fun!'));
app.get('/someother', (req, res) => res.send('yea got someother!'));
app.post('/', (req, res) => res.send('Recieved a POST method'));



//Initialize Spark
app.use(function(req, res, next) {
    req.spark = CiscoSpark.init({
      config: {
        credentials: {
            authorizationString: 'https://api.ciscospark.com/v1/authorize?client_id='+process.env.SPARKCLIENTID+'&response_type=code&redirect_uri=https%3A%2F%2F2rbqkdoll4.execute-api.us-east-1.amazonaws.com%2Flatest%2Foauth%2Fcallback&scope=spark%3Aall%20spark%3Akms&state=happy',
            //client_id: process.env.SPARKCLIENTID,
            client_secret: process.env.SPARKCLIENTSECRET
            //redirect_uri: process.env.CALLBACKURL,
            //scope: 'spark:all spark:kms'
        }
      }
    });
    req.spark.once(`ready`, next);
});

app.get(`/login`, (req, res) => {
    // buildLoginUrl() defaults to the implicit grant flow so explicitly pass
    // `confidential` to generate a URL suitable to the Authorization Code grant
    // flow.
    res
      .redirect(req.spark.credentials.buildLoginUrl({clientType: 'confidential'}))
      .end();
});
  
app.get(`/oauth/redirect`, (req, res, next) => {
    assert(req.params.code);
    req.spark.requestAuthorizationCodeGrant(req.params)
    .then(() => {
        res.redirect(`/`).end();
    })
    .catch(next);
});

app.get('/oauth/callback',(req, res)=> res.send(req.protocol + '://' + req.get('host') + '/latest'));
*/


//use router for any /oauth/* endpoint
app.use('/test', router);

// route middleware that will occur on every request
router.use(function(req, res, next) {
    // log each request to the console
    console.log(req.method, req.url);
    // continue doing what we were doing and go to the route
    next(); 
});

router.get('/',(req, res)=> res.send(req.originalUrl));
router.get('/code',(req, res)=> res.send('Im inside the code path of router'));
router.get('/callback',(req, res)=> res.send(req.protocol + '://' + req.get('host') + '/latest' + req.originalUrl));
router.get('/hooks/:hookid',(req, res)=> res.send('got hookid = ' + req.params.hookid));
router.get("/ejs/:name", (req, res) => res.render('index-greyscale',{ user: req.params.name}));




// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
//---------------------------------------------------------------------------
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Cisco Spark profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
    //console.log('\n serializeUser output' + user);
    done(null, user);
});

passport.deserializeUser(function(obj, done){
    //console.log('\n DE-serializeUser output' + JSON.stringify(obj));
    done(null, obj);
});

// Use the SparkStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Spark
//   profile), and invoke a callback with a user object.
passport.use(new CiscoSparkStrategy({
        clientID: process.env.SPARKCLIENTID,
        clientSecret: process.env.SPARKCLIENTSECRET,
        callbackURL: process.env.CALLBACKURL,
        scope: [
            'spark:all'
            //'spark:rooms_read',
            //'spark:rooms_write',
        ]
    },
    function(accessToken, refreshToken, profile, done) {
        console.log("Received access token : " + accessToken);
        console.log("Received refresh token : " + refreshToken);
        //console.log("Received profile : " + JSON.stringify(profile));
        ///// - globally sets!!! app.set('UserToken', accessToken);
        //process.nextTick(function (req, res, next) {
        process.nextTick(function () {
            console.log("INSIDE THE FUNCTION WHERE ACCESSTOKEN IS SAVED -- \n"+ accessToken + '\n' + profile.id);
            //redclient.set(profile.id, accessToken);
            //next();
        });
        // asynchronous verification
        process.nextTick(function () {
            // To keep the example simple, the user's Cisco Spark profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Cisco Spark account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
            //return done(accessToken, profile);
        });
    }
));
//---------------------------------------------------------------------------
//*****************************************************************
// ROOT PAGE
//*****************************************************************
app.get('/', function(req, res) {
    res.render('theme-webuild/index', { user: req.user });
    console.log('Cookies: ', req.cookies);
    //res.redirect("someplace");
  });


//*****************************************************************
// LOGIN PAGE
//*****************************************************************
app.get('/login', function(req, res){
    res.render('login', { user: req.user });
    //res.redirect('/');
  });
  
//*****************************************************************
// AUTHENTICATION PAGE
//*****************************************************************
// GET /auth/spark
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Cisco Spark authentication will involve
//   redirecting the user to ciscospark.com (https://api.ciscospark.com/v1/authorize).  After authorization, Cisco Spark
//   will redirect the user back to this application at /auth/spark/callback
app.get('/auth/spark',
passport.authenticate('cisco-spark'),
function(req, res) {
    // The request will be redirected to Cisco Spark for authentication, so this
    // function will not be called.
});

//*****************************************************************
// AUTH CALL BACK PAGE FOR IDBROKER
//*****************************************************************
// GET /auth/spark/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/oauth/callback', 
passport.authenticate('cisco-spark', {
    failureRedirect: '/login',
    successRedirect: '/latest/',
    //failureFlash: true
}));

//*****************************************************************
// LOGOUT PAGE
//*****************************************************************
app.get('/logout', function(req, res){
req.logout();
res.redirect('/');
});

//*****************************************************************
// FUNTION TO CHECK IF LOGGED IN USER IS AUTHENTICATED
//*****************************************************************
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    //console.log('--ensureAuthenticated request : ' + req + '\n --ensureAuthenticated resposne : ' + res + '\n --ensureAuthenticated next : ' + next);
    if (req.isAuthenticated()) { 
      return next(); 
    }
    res.redirect('/login');
  }



//export app to Lambda handler
module.exports = app;