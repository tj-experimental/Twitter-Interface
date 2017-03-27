const fs = require('fs');
const auth = require('../private_auth/auth.json');
const Twit = require('twit');

const config = {consumer_key: auth.consumer_key,
                consumer_secret: auth.consumer_secret,
                access_token: auth.access_token,
                access_token_secret: auth.access_token_secret};

var T = new Twit(config);

T.post('statuses/update', {status: 'Testing twitter api'},
function(err, data, response){
    if (err) console.error(err);
    console.log(data);
    console.dir(response);
});






