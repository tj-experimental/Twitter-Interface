'use strict';

var express = require('express'),
    fs = require('fs'),
    auth = require('./config.js'),
    Twit = require('twit'),
    authConfig = auth.config,
    config = {consumer_key: authConfig.consumer_key,
                consumer_secret: authConfig.consumer_secret,
                access_token: authConfig.access_token,
                access_token_secret: authConfig.access_token_secret,
                timeout_ms : authConfig.timeout_ms },

     T = new Twit(config);


T.post('statuses/update', {status: 'Testing twitter api'},
function(err, data, response){
    if (err) console.error(err);
    console.log(data);
    console.dir(response);
});






