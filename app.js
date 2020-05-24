'use strict';

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('flash');
const port = process.env.PORT || 5000;
const session = require('express-session');
const app = express();
const timeAgo = require('./public/js/time-ago.js');
const auth = { config: {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: process.env.TIMEOUT_MS || 10000
}};
const Twit = require('twit');
const multer = require('multer');
const MobileDetect = require('mobile-detect');
const upload = multer();
const T = new Twit(auth.config);
const templates = path.join(__dirname, 'templates');
const staticFiles = path.join(__dirname, '/public');

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

app.get('/clear-flash', function (req, res) {
    var backURL=req.header('Referer') || '/';
    req.session.flash.pop();
    res.redirect(backURL);
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
                                            T.get('friends/list', {screen_name: userDetials.screen_name, count: 100})
                                                .catch(function (err) {
                                                    console.error('caught error', err.stack);
                                                    res.status(305).render('error');
                                                }).then(function (result) {
                                                    followersData = result.data.users;
                                                    T.get('direct_messages', {count: 100})
                                                        .catch(function (err) {
                                                            console.error('caught error', err.stack);
                                                            res.status(305).render('error');
                                                        }).then(function (result) {
                                                            directMessages = result.data;
                                                            res.render('index_', {
                                                                handle: userDetials.screen_name,
                                                                timeLines: timeLineData,
                                                                timeLinesCount: timeLineData.length,
                                                                bannerUrl: banner.url,
                                                                profileImageUrl: profile.profile_image_url,
                                                                followers: followersData,
                                                                directMessages: directMessages,
                                                                directMessagesCount : directMessages.length,
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
                console.error('Caught error verifying credentials: ', err.stack);
                res.status(305).render('error');
            }).then(function (result) {
                userData = result.data;
                if (userData.screen_name === name && password){
                    req.session.valid =  true;
                    req.flash('success', 'Logged in Successfully.');
                    res.redirect('/user');
                }
                else{
                    req.flash('error', 'Invalid screen name please try again.');
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
            T.post('statuses/update', {status: tweet}, function (err) {
                if (err) {
                    console.error('Caught error updating status', err.stack);
                    msg = 'Tweet Unable to be delivered';
                    req.flash('error', msg);
                } else {
                    msg = 'Tweet Sent';
                    req.flash('success', msg);
                }
                // console.dir(data);
                // console.dir(response);
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
