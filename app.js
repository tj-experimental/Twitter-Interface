'use strict';

var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    EventEmitter = require('events'),
    port = 5000,
    screenName = 'tonyejack1',
    app = express(),
    fs = require('fs'),
    auth = require('./public/js/config.js'),
    Twit = require('twit'),
    authConfig = auth.config,
    multer = require('multer'),
    upload = multer(),
    T = new Twit(authConfig),
    templates = path.join(__dirname, 'templates'),
    staticFiles = path.join(__dirname, '/public' );


// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');


app.use('/static',express.static(staticFiles));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'jade');
app.set('views', templates);

var streamTweets = T.stream('statuses/home_timeline');

app.get('/home', function(req, res){
   res.sendFile('index.html', {root: __dirname});
});


app.get('/sign-in', function (req, res) {
   res.render('sign_in')
});

app.get('/', function(req, res){
    res.render('sign_in');
});

app.get('/user', upload.array(), function (req, res) {
    var user, data;
    user = {handle: screenName, sign: {url:'/sign-out', text:'Sign Out'}};

    setImmediate(function () {
        T.get('statuses/home_timeline', function (err, data, response) {
            res.render('index_', {user: user, content: data});
        });
        // Get the followers from twitter
        // T.get('followers/ids', { screen_name: screenName },  function (err, data, response) {
        //     console.log(data);
        //
        // });
    });
});


app.post('/', upload.array(), function (req, res, next) {
    var body, name, password;
    body = req.body;
    name = body.user_name;
    password = body.password;

    if(name === undefined || password === undefined || password === '' || name === ''){
        res.redirect('/sign-in');
    }else{
        res.redirect('/user');
    }
});


app.get('/sign-in', function (req, res) {
    var user = {handle: 'Tommy'};
    res.render('sign_in', {user: user});
});


app.listen(port, function () {
   console.log("Server running on port %d", port);
});


app.post('/post-tweet', upload.array() , function (req, res, next) {
    var body, tweet, success, msg;
    body = req.body;
    tweet = body['text-area'];
    success = true;

    if (tweet !== undefined && tweet !== ""){
        setImmediate(function () {
            T.post('statuses/update', {status: tweet}, function (err, data, response) {
                if (err) {
                    success = false;
                    console.error(err);
                }
                console.log(data);
                console.dir(response);
            });
            if(success === true) {
                msg = 'Tweet Sent';
            }else {
                msg = 'Tweet Unable to be delivered';
            }
            res.render('index_', {success:success, msg: msg});
        });
    }else{
        res.redirect('back');
    }
});

//
// T.post('statuses/update', {status: 'Testing twitter api'},
// function(err, data, response){
//     if (err) console.error(err);
//     console.log(data);
//     console.dir(response);
// });






