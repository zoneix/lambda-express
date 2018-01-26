// Refer to https://claudiajs.com/tutorials/serverless-express.html for deplyment commands

require('dotenv').config();
const express = require('express');
const app = express();
const router = express.Router();

var passport = require('passport'),
    _ = require('lodash'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    util = require('util'),
    CiscoSparkStrategy = require('passport-cisco-spark').Strategy;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(logger('combined'));
/* Sample default routes for app
app.get('/', (req, res) => res.send('Hello Lambda world - you are too much fun!'));
app.get('/someother', (req, res) => res.send('yea got someother!'));
app.post('/', (req, res) => res.send('Recieved a POST method'));
*/

//use router for any /oauth/* endpoint
app.use('/oauth', router);

// route middleware that will occur on every request
router.use(function(req, res, next) {
    // log each request to the console
    console.log(req.method, req.url);
    // continue doing what we were doing and go to the route
    next(); 
});

//router.get('/',(req, res)=> res.send(process.env.SPARKCLIENTID));
router.get('/code',(req, res)=> res.send('Im inside the code path of router'));
router.get('/callback',(req, res)=> res.send(req.protocol + '://' + req.get('host') + '/latest' + req.originalUrl));
router.get('/hooks/:hookid',(req, res)=> res.send('got hookid = ' + req.params.hookid));
router.get("/ejs/:name", (req, res) => res.render('index-greyscale',{ user: req.params.name}));



//export app to handler
module.exports = app;

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

