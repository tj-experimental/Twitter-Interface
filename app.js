'use strict';

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var flash = require('flash');
var port = process.env.PORT || 5000;
var session = require('express-session');
var app = express();
var timeAgo = require('./public/js/time-ago.js');
var auth = require('./public/js/config.js');
var Twit = require('twit');
var authConfig = auth.config;
var multer = require('multer');
var MobileDetect = require('mobile-detect');
var upload = multer();
var T = new Twit(authConfig);
var templates = path.join(__dirname, 'templates');
var staticFiles = path.join(__dirname, '/public');

app.use('/static', express.static(staticFiles));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'jade');
app.set('views', templates);
app.use(cookieParser('keyboard cat'));
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));
// use  the flash middleware
app.use(flash());

// For live streaming tweets not needed
// var streamTweets = T.stream('statuses/sample');
//
// streamTweets.on('tweet', function (tweet) {
//     console.log(tweet);
// });

app.get('/home', function (req, res) {
    res.sendFile('index.html', {root: __dirname});
});

app.get('/sign-in', function (req, res) {
    res.render('sign_in');
});

app.get('/', function (req, res) {
    res.redirect('/sign-in');
});

app.get('/user', upload.array(), function (req, res) {
    var timeLineData = [], followersData = [],
        directMessages = [], userDetials = {},
        banners = {}, banner = {}, profile = {};
    var md = new MobileDetect(req.headers['user-agent']);
    var valid = req.session.valid;

    if(valid){
        setImmediate(function () {
            T.get('account/settings')
                .catch(function (err) {
                    console.error(err);
                    res.status(305).render('error');
                })
                .then(function (result) {
                    userDetials = result.data;
                    T.get('users/profile_banner', {screen_name: userDetials.screen_name})
                        .catch(function (err) {
                            console.error('caught error', err.stack);
                            res.status(305).render('error');
                        })
                        .then(function (result) {
                            banners = result.data;
                            if(banners.sizes){
                                if (md.phone() !== null) banner = banners.sizes.mobile_retina;
                                if (md.tablet() !== null) banner = banners.sizes.ipad;
                                else banner = banners.sizes.web_retina;
                            }
                            T.get('users/show', {screen_name: userDetials.screen_name})
                                .catch(function (err) {
                                    console.error('caught error', err.stack);
                                    res.status(305).render('error');
                                })
                                .then(function (result) {
                                    profile = result.data;
                                    T.get('statuses/home_timeline', {count: 5})
                                        .catch(function (err) {
                                            console.error('caught error', err.stack);
                                            res.status(305).render('error');
                                        }).then(function (result) {
                                            timeLineData = result.data;
                                            // Get the followers from twitter
                                            T.get('followers/list', {screen_name: userDetials.screen_name, count: 5})
                                                .catch(function (err) {
                                                    console.error('caught error', err.stack);
                                                    res.status(305).render('error');
                                                }).then(function (result) {
                                                    followersData = result.data.users;
                                                    T.get('direct_messages', {count: 5})
                                                        .catch(function (err) {
                                                            console.error('caught error', err.stack);
                                                            res.status(305).render('error');
                                                        }).then(function (result) {
                                                            directMessages = result.data;
                                                            res.render('index_', {
                                                                handle: userDetials.screen_name,
                                                                timeLines: timeLineData,
                                                                bannerUrl: banner.url,
                                                                profileImageUrl: profile.profile_image_url,
                                                                followers: followersData,
                                                                directMessages: directMessages,
                                                                followersCount: followersData.length,
                                                                timeAgo: timeAgo
                                                            });
                                                        });
                                                });
                                        });
                                });
                        });

                });
        });
    }
    else{
        res.redirect('/sign-in');
    }
});


app.post('/sign-in', upload.array(), function (req, res) {
    var body;
    var userData;
    var name;
    var password;
    body = req.body;
    name = body.user_name;
    password = body.password;
    req.session.valid =  null;

    setImmediate(function () {
        T.get('account/verify_credentials')
            .catch(function (err) {
                console.error('caught error', err.stack);
                res.status(305).render('error');
            }).then(function (result) {
                userData = result.data;
                if (userData.screen_name === name && password){
                    req.session.valid =  true;
                    res.redirect('/user');
                }
                else{
                    res.flash('error', 'Invalid screen name please try again.');
                    req.session.valid =  null;
                    res.redirect('/sign-in');
                }
            });
    });
});

app.post('/post-tweet', upload.array(), function (req, res) {
    var body, tweet, msg;
    body = req.body;
    tweet = body['text-area'];

    if (tweet !== undefined && tweet !== '') {
        setImmediate(function () {
            T.post('statuses/update', {status: tweet}, function (err, data, response) {
                if (err) {
                    console.error(err);
                    msg = 'Tweet Unable to be delivered';
                    res.flash('error', msg);
                } else {
                    msg = 'Tweet Sent';
                    res.flash('info', msg);
                }
                res.redirect('/user');
            });
        });
    } else {
        res.redirect('back');
    }
});


app.get('*', function (req, res) {
    res.status(404).render('notFound', {route: req.url});
});

app.listen(port, function () {
    console.log('Server running on port %d', port);
});
