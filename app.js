'use strict';

var express = require('express'),
    path = require('path'),
    port = 5000,
    app = express(),
    fs = require('fs'),
    auth = require('./public/js/config.js'),
    Twit = require('twit'),
    authConfig = auth.config,
    config = {consumer_key: authConfig.consumer_key,
                consumer_secret: authConfig.consumer_secret,
                access_token: authConfig.access_token,
                access_token_secret: authConfig.access_token_secret,
                timeout_ms : authConfig.timeout_ms },

    T = new Twit(config),
    templates = path.join(__dirname, 'templates'),
    staticFiles = path.join(__dirname, '/public' );


app.use('/static',express.static(staticFiles));
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');
app.set('view engine', 'jade');
app.set('views', templates);


app.get('/', function(req, res){
   res.sendFile('index.html', {root: __dirname});
});

app.get('/home', function(req, res){
    var user = {handle: '@tj!', sign: {url:'/sign-out', text:'Sign Out'}};
    res.render('index_', {user: user});
});

app.get('/sign-out', function (req, res) {
    var user = {handle: undefined, sign: {url:'/home', text:'Sign In'}};
   res.render('sign_out', {user: user})
});


app.listen(port, function () {
   console.log("Server running on port %d", port);
});

//
// T.post('statuses/update', {status: 'Testing twitter api'},
// function(err, data, response){
//     if (err) console.error(err);
//     console.log(data);
//     console.dir(response);
// });






