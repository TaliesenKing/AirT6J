# PHASE 1 ( API ROUTES ) 
----------------------------------------------------------------

This will be a short one. This is not a huge phase. It is just a phase that is going to help us set up the basic skeletal structure of where our `routes` are going to go. 

So we will start by creating an `api` folder inside of our `routes` folder. And inside that `api` folder we are going to create another `index.js` file. So we are going to have a couple index.js files floating around in this project skeleton. So it is going to be important as we go to make sure you are working in the correct `index.js` file : 

```plaintext
.
|-- backend/
  |-- bin/
    |-- www
  |-- config/
    |-- database.js
    |-- index.js 
  |-- db/
    |-- migrations/
    |-- models/
    |-- seeders/
  |-- node_modules/
  |-- routes/
    |-- api/
      |-- index.js
    |-- index.js
  |-- .env
  |-- .sequelizerc
  |-- app.js
  |-- package-lock.json
  |-- package.json
  |-- psql-setup-script.js
|-- frontend/
|-- images/
|-- .gitignore
|-- README.md 
```

So now in that file, we are going to instantiate a new router object here so make sure to export that router object : 

routes/api/index.js
```js
const router = require('express').Router(); 



module.exports = router; 
``` 

Now, back in the `index.js` file in the `routes` folder, here we are going to __import__ that `api router` and apply that router with a `router.use` here. So go ahead and import that in the top of the file :  

routes/index.js
```js 
const express = require('express'); 
const router = express.Router(); 
const apiRouter = require('./api');     // importing that api router 

router.get('/api/csrf/restore', (req, res) => {
    const csrfToken = req.csrfToken(); 
    res.cookie('XSRF-TOKEN', csrfToken);
    res.status(200).json({
        'XSRF-Token': csrfToken
    });
}); 

router.use('/api', apiRouter);         // we can place the router.use right here. 
// The requests that we get for those csrf tokens, we don't need those requests to pass in the api router first. 


module.exports = router; 
```

# TEST THE API ROUTER 
----------------------------------------------------------------

So, this `index.js` file in the `api` folder is where we will eventually put all of the `router.uses` for all of the individual `routers` for our different resources. Again, things like `spots`, `groups`, `events`, `reviews`, etc. The `routers` they are all going to come through here than the `routes/index.js` folder. So we are creating a bit of a nested structure here. 

So in the nested `index.js` file inside of the `api` directory, we are going to throw this one little test endpoint here : 

routes/api/index.js
```js
const router = require('express').Router(); 



router.post('/test', function (req, res) {              // our test endpoint 
    res.json({ requestBody: req.body }); 
})


module.exports = router; 
``` 

Notice that this is an endpoint for a `post` request and also notice that even though we have just `/test` here, the path to this request is going to be `/api/test`. So let's keep that in mind as we are testing this out!

So, our goal is to be able to send a `post` request using a `csrf token` and then just get back the `request body` that we sent to kinda just test some of our configuration like the `csrf token` and also make sure that we are able to parse and read `request bodies`

So let's start by navigating to this endpoint here in our browser. 

So we run : 

>> npm start 

Then go to : 

>> localhost:8000/api/csrf/restore

And we should see a 'XSRF-Token' so go ahead and grab the value of that including the quotes. 

Then open up the console in our browser (via inspect) so we can send this fetch request so we can test out our csrf token which we will paste into that spot right here : 

// console in browser 
```js
fetch('/api/test', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'XSRF-TOKEN': `<value of XSRF-TOKEN cookie>`
    }, 
    body: JSON.stringify({ hello: 'world'})
}).then(res => res.json()).then(data => console.log(data)); 
```

We just want to make sure we essentially get this back just to test our `csrf functionality` and our `request body parsing functionality`. 

So we copy and past the above code and hope over to our browser into our console and then paste that fetch code in and take the csrf value and copy it and replace that placeholder within the code and hit `ENTER` and there we go, we have our response. Looks like there is a request body with a property of hello and a value of 'world'. So it seems to be working as expected! 

# END OF PHASE 1 ( API ROUTES )
----------------------------------------------------------------

