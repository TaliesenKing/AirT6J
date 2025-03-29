# PHASE 2 ( ERROR HANDLING )
--------------------------------------------------------------------------------------------------------

Welcome to the third video of `Phase 2`. So with this phase we are going to set up a few kind of basic `ERROR HANDLING MIDDLEWARE` 

As you get into your project, it is okay to make some adjustments to this error handling middleware. Make sure you are getting the `errors` that you want and expect on your __client__. 

Keep in mind, something important with error handling, is that we only want the errors that are actually appropriate for whatever error actually happened. So in your documentation for example, if you see a big long list of error messages, that does not necessarily mean that we want all of those error messages when we have an error for that particular endpoint. We want to make sure we ONLY send the relevant error messages. 

So if I am a `User` trying to sign up on the application and maybe provide a valid email and username BUT NOT a valid password (it's too short/not valid characters), I don't want to send back error messages that say things like 'Please provide a username' or 'your username is invalid'. I only want to send an error message related to the issue with the password! 

As you kinda go through your project and dealing with errors, keep that in mind! We want specific relevant error messages!


# RESOURCE NOT FOUND ERROR-HANDLER 
--------------------------------------------------------------------------------------------------------

So let's get started! This is all going to be in our `app.js` file after `app.use(routes)` and again as with all of our `error handling middleware` it is going to appear at the end so it will go below our `route handlers` (app.use(routes)). 

This code block below is the `not error - error handler` this is the `404/resource not found` error handler that doesn't actually take in an error. So we take a look at the arguments that we take in with this callback, we are only taking in the request, response, and next. The reason for that is just that we don't expect this middleware to take in an error, we expect this middleware to take in requests that are not otherwise being handled. 

So if a request gets to this point, and we create a new `error object`, we give that error object a `title`, an error's property with an `array` with a string in there, and this array exists just in case other errors pop up someway, somehow, we can just push those errors into that array. This is going to be something that I really recommend you do with your error handling. Just push those errors into an array, and then eventually send the array of those relevant error messages back to the client. 

We are setting a `status` property of that error object which keep in mind it is NOT THE SAME as setting the status of the response. This is just setting a value on an object. And we are invoking `next` passing in that error that we created. 

The `underscores` that we have next to `req` and `res` aren't anything special. Whoever wrote this walkthrough just used this as an `indication` that we are just not using these arguments in this callback function. That is all that indicates. If you see the code within we don't reference req or res in that middleware. 

backend/app.js
```js 
// code above 

app.use(routes);

// Catch unhandled requests and forward to error handler 
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found."); 
    err.title = "Resource Not Found"; 
    err.errors = ["The requested resource couldn't be found."]; 
    err.status = 404;
    next(err);
});

module.exports = app; 
```

So that is our 404 Error Handler! 


# SEQUELIZE ERROR-HANDLER
--------------------------------------------------------------------------------------------------------

Next, we have an error handler meant to help us catch `validation errors` with `Sequelize`. So if we attempt to create some record in Sequelize, with issues, we will often get back a specific type of error called a `Validation Error`. So this middleware in the code below is just meant to catch those particular errors. 

A `map` over whatever object we are getting and that creates a little array. 

backend/app.js
```js
// other imports ...

const { ValidationError } = require('sequelize');
// code above with the other imports

app.use(routes);

// Catch unhandled requests and forward to error handler 
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found."); 
    err.title = "Resource Not Found"; 
    err.errors = ["The requested resource couldn't be found."]; 
    err.status = 404;
    next(err);
});

// Process Sequelize Errors 
app.use((err, _req, _res, next) => {        // not directly referencing the req and res
    //check if error is a Sequelize error
    if (err insanceof ValidationError) {
        err.errors = err.errors.map((e) => e.message); // mapping all of those errors into an array here
        err.title = 'Validation error'; 
    }
    next(err);                             // at the end of the process, calling in next and passing our error object
});

module.exports = app; 
```

^ We want to make sure that is under the 404 error middleware and we want to make sure that we are importing this Validation Error thing from Sequelize! So we will put that at the top of our app.js

# ERROR FORMATTER ERROR-HANDLER 
--------------------------------------------------------------------------------------------------------

Finally, we have our `error formatter` the thing that will actually end up sending the response back to the __client__. So this will go at the very end of this error pipeline. 

backend/app.js
```js
// other imports ...

const { ValidationError } = require('sequelize');
// code above with the other imports

app.use(routes);

// 1. Catch unhandled requests and forward to error handler 
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found."); 
    err.title = "Resource Not Found"; 
    err.errors = ["The requested resource couldn't be found."]; 
    err.status = 404;
    next(err);
});

// 2. Process Sequelize Errors 
app.use((err, _req, _res, next) => {        // not directly referencing the req and res
    //check if error is a Sequelize error
    if (err insanceof ValidationError) {
        err.errors = err.errors.map((e) => e.message); // mapping all of those errors into an array here
        err.title = 'Validation error'; 
    }
    next(err);                             // at the end of the process, calling in next and passing our error object
});

// 3. Error Formatter 
app.use((err, _req, _res, next) => {
    res.status(err.status || 500);  // Set the status of the response equal to the status property object if it exists
    console.error(err);
    res.json({
        title: err.title || 'Server Error', 
        message: err.message,
        errors: err.errors, 
        stack: isProduction ? null : err.stack
    });
}); 

module.exports = app; 
```
`Line by line breakdown for #3` 
^ We are going to set the status of the response equal to the status property object if it exists (err.status = 404 in first error middleware) like if our request got through this first particular middleware , we would have a status property of the error object otherwise if we DO NOT have that status property, we will just use a default value of 500. 

We are console logging that error to our terminals so that we as developers make sure we see that. Eventually we will want to comment this out and remove it. It is bad practice to have console logs in production. 

In our response we are sending the title of the error or a default title if we don't have an otherwise defined title. 

Any error messages, the errors themselves, which often should be an array of errors, which is generally the easiest for use on the front end of our application. 

The last property, the stack property, is going to be different depending on what environment we are in. In Phase 0, we mentioned the environment code where we are pulling in the environment variable from the `config/index.js` file which determines what environment we are in. And then we are checking to see whether we are in the `production` environment. 

Down in that third error handler, we are ONLY GOING TO PROVIDE THE STACK IN THE RESPONSE IF WE ARE NOT IN PRODUCTION. IF WE ARE IN PRODUCTION WE ARE NOT GOING TO PROVIDE THE ACTUAL STACK. Again, this is a security thing, we don't want to expose a bunch of error information and potentially our file structure, variable names but we don't necessarily want people to easily access.

So if we are in production, if this is true, then this property will be set to `null` if it IS NOT TRUE we will go ahead and set it to the `err.stack` of course that is helpful in development testing environments. 

So that is all for our generic error handlers. This is not necessarily all you will use or need, feel free to add extra error handling as your application needs! 

# TESTING THE ERROR HANDLERS 
--------------------------------------------------------------------------------------------------------

So with all of that in place, we are going to test a bit of this out! So let's start up our server and make this request which we do not have an endpoint for : 

>> localhost:8000/not-found

If you see the json below, you have successfully set up your `Resource Not Found` and `Error Formatter` error handlers! 

```js
{
    "title": "Resource Not Found",
    "message": "The requested resource couldn't be found.",
    "errors": [
        "The requested resource couldn't be found."
    ]
    "stack": "Error: The requested resource couldn't be found./n ...<stack .... " 
}
```

Let's continue to test some stuff. We want to make sure our csrf route is still working to see if we still get a token which we do so everything should be working well.

>> localhost:8000/api/csrf/restore

# END OF PHASE 2 ( ERROR HANDLING ) 
--------------------------------------------------------------------------------------------------------
