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

//use router for any /oauth/* endpoint
app.use('/oauth', router);

//export app to handler
module.exports = app;

