# Twitter-Interface


This project, uses Twitter’s REST API to access your Twitter profile information and render it to a user. The page automatically authenticate access to your Twitter profile. To populate three columns on your page:

Your 5 most recent tweets. Your 5 most recent friends. Your 5 most recent private messages.

Also allows users to post a new tweet to their twitter account.

### Usage 

- Download or Clone repository

#### Install dependencies
 - `npm install` to install package dependencies

#### Get the twitter OAuth configurations from app at https://apps.twitter.com/
 1. Create new application.
 2. Generate Access Token.
 3. Generate Consumer key.

#### Set Required environment variables 

- ACCESS_TOKEN
- ACCESS_TOKEN_SECRET
- CONSUMER_KEY
- CONSUMER_SECRET

##### Optionally set
- TIMEOUT_MS
 
 #### Start app 
 - `node app.js`
 
 #### Run test 
  - `npm install --only=dev`
  - `npm run test`
