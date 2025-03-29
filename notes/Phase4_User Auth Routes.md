# PHASE 4 ( USER AUTHENTICATION ROUTES )
--------------------------------------------------------------------------------------------------------

We are going to go through Phase 4 in this video. In Phase 4 we are going to set up a few endpoints: 

1. One for `logging in a user`
2. One for `logging out a user`
3. One for `signing up a new user`
4. One for `retrieving the current user's information`

So... the first thing we are going to do is set up a couple of router files. So in our `api folder` we are going to create a `session.js` file and a `users.js` file and we are going to do our imports of the router and express and then export that router : 

backend/routes/api/session.js
```js
const express = require('express');
const router = express.Router(); 


module.exports = router; 
```

backend/routes/api/users.js
```js
const express = require('express');
const router = express.Router(); 


module.exports = router; 
```

Once those are set up, we are going to hop back into our `api/index.js` file and import those routers and apply those routers like so : 

(And we can safely override all of the existing code content in here. Most of that stuff was just testing the last phase. To see the code before the change, refer to Phase 3)

backend/routes/api/index.js
```js
const router = require('express').Router(); 
const sessionRouter = require('./session.js'); // importing our current couple of router files 
const usersRouter = require('./users.js');     // importing our current couple of router files 
const { restoreUser } = require('../../utils/auth.js');

// Connect restoreUser middleware to the API router
// If current user session is valid, set req.user to the user in the database
// If current user session is NOT valid, set req.user to null

router.use(restoreUser);                       // our restoreUser middleware applying here is going to be GLOBAL MIDDLEWARE 
// So all of the routers that we apply moving forward, we want to make sure everything is placed AFTER this restoreUser middlware here.

router.use('/session', sessionRouter);         // we have our session router 

router.use('./users', usersRouter);            // our users router 

router.post('./test', (req, res) => {          // and a quick little test endpoint which you will be using again in MOD 5 when you
    res.json({ requestBody: req.body });       // start building the frontend of this application. So I would recommend leaving this 
});                                            // in place for now. 

module.exports = router; 
```

So that is our basic set up here!

# USER LOGIN API ROUTE 
--------------------------------------------------------------------------------------------------------

So, in our `session.js` file we are going to start with our `login route`. So in addition to importing `express` and using our `router`, we are going to import our `sequelize operators` and `bcrypt` and a couple of our `helper functions` here as well as our `User` model : 

backend/routes/api/session.js
```js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router(); 


module.exports = router; 
```

Next, we are going to add in our `POST` route :

backend/routes/api/session.js
```js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router(); 

// Log in 
router.post(            // we have ourselves a post request 
    '/',
    async (req, res, next) => {
        const { credential, password } = req.body;  // we are taking in a credential property and a password property
        // Importantly, ^ this credential can be EITHER a username or email.... 

        const user = await User.unscoped().findOne({ // notice we are using this unscoped method (see notes under this section)
            where: {
                [Op.or] {                   // We are going to use the 'or' Operator in our query to look for either a record with the 
                    username: credential,   // username of that input or...
                    email: credential       // with an email of that input
                }                           // so that we can just run a single query regardless of which piece of information the user 
            }                               // gives us in this credential property here
        }); 

    // And then of course the password which we are going to need to hash. So once we query for our user, we are going to check to make sure that we actually have a user record and then we are going to take the hashedPassword property of that user and the plain text password and pass those into our bcrypt compare method here and IF we FAIL either of these checks, then we are going to throw an error letting the client know the login failed and that the provided credentials were invalid. 
    
    if (!user || !brcypt.compareSync(password. user.hashedPassword.toString())) {
        const err = new Error('Login failed'); 
        err.status = 401;
        err.title = 'Login failed';
        err.errors = { credential: 'The provided credentials were invalid.' }; // notice this message (see comments below)
        return next(err);
    }

    const safeUser = { 
        id: user.id,
        email: user.email,
        username: user.username
    }; 

    await setTokenCookie(res, safeUser);

    return res.json({
        user: safeUser
    }); 
    }
); 

module.exports = router; 
```

^ `User.unscoped` notice we are using this `unscoped` method which is allowing us to get around our `defaultScope` here in our `db/models/user.js file` : 

backend/db/models/uder.js
```js
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt'],
        },
      },
```

And the reason that we want to get around our `defaultScope` in this particular instance is because we actually do need the `hashedPassword`. We want to be very careful and not send that information along to the __client__ but we DO NEED that information for our comparison here. So we are using this `unscoped` method to get back ALL OF THE USER DATA from this particular query. 

The other thing to note is our `error message` in `err.errors`. By and large, it is good practice to provide relatively clear error messages to indicate to the user exactly what went wrong so they can fix it without needing to do trial and error. However, the EXCEPTION to that is with `User Authentication`. We DO NOT WANT TO PROVIDE OR VOLUNTEER ANY INFORMATION to any potential bad actors that they shouldn't necessarily have access to. 

So for instance, if the `bad actor` gives us an email that we don't actually have an account for, we could throw an error that says `That email is not present in our database` but that is potentially giving the `bad actor` information so they can determine whether there is an account on our application using that email. Which is not necessarily information we want people to have. So rather than telling the user what exactly went wrong with their log in attempt we are just going to tell them that there attempt failed. 

So... we are performing those checks, again, checking to make sure we have a user in our database with those credentials and checking the password. Then assuming we pass those checks, we are going to create a `safeUser object` with just those the data we are deeming safe which in this case is `id`, `email`, and `username` certainly EXCLUDING the `hashedPassword` and of course the `plaintext password`. 

We are going to pass that object into our `setTokenCookie` method which we may remember from the previous phase is the `helper function` that we are going to use to generate the `token` for our `users`. 

And then we are going to send a `response` back to the __client__ just containing this basic user information in `safeUser` object. 

So, that is our log in route! 

# TEST THE LOGIN ROUTE 
--------------------------------------------------------------------------------------------------------

Test the login route by navigating to : 

>> localhost:8000/api/csrf/restore 

And making a `fetch` request from the browser's DevTools console. Remember to pass the value of the `XSRF-TOKEN` cookie as a header in the `fetch` request because the login route has a `POST` HTTP verb. 

```js
fetch('/api/session', {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
    },
    body: JSON.stringify({ credential: 'Demo-lition', password: 'password' })
}).then(res => res.json()).then(data => console.log(data)); 
```

1. So let's make sure our server is running via `npm start`
2. So we first need to grab a csrf token by hitting that above link to restore our `csrf`
3. This is going to be the `csrf token` that we are going to need for any NON `GET` requests that we are sending to our API at this point. 
4. So we copy and paste that `token` and open up `inspect` and open up our `console` 
5. Throw that above `fetch` request into the console, pasting that `token` over the `<value placeholder>`
6. We are going to log in to one of our existing seed data records from the previous videos
7. Once we hit enter, we are getting back our `user object`
8. We can check our `token` functionality is working here, so we can delete our `token` in `Applications` and try logging in one more time
9. If we run the same `fetch` code our `token` should reappear in `Applications` 

--------------------------------------------------------------------------------------------------------

Then try to login with the demo user with the email next : 

--------------------------------------------------------------------------------------------------------

```js
fetch('/api/session', {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
    },
    body: JSON.stringify({ credential: 'demo@user.io', password: 'password' })
}).then(res => res.json()).then(data => console.log(data));
```

Definitely recommend you DO NOT skip on these testing specs! 

1. So we paste in our `csrf token` in the `value placeholder` and hit enter and we should see a success! 

--------------------------------------------------------------------------------------------------------

Now we are going to test invalid values here 

--------------------------------------------------------------------------------------------------------

>> So we will first test the `invalid password` : 

```js
fetch('/api/session', {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "XSRF-TOKEN": `<value of XSRF-TOKEN cookie here>`
    },
    body: JSON.stringify({ credential: 'Demo-lition', password: 'Hello World' })
}).then(res => res.json()).then(data => console.log(data));
```

1. So again take our `token` paste it in the `fetch` code and try to login with a password of 'Hello World'
2. And we get back `login failed` with `provided credentials were invalid`... so perfect!

>> Now we will test by changing password back to the valid `password` and changing the `username` :

```js
fetch('/api/session', {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "XSRF-TOKEN": `<value of XSRF-TOKEN cookie here>`
    },
    body: JSON.stringify({ credential: 'Deen', password: 'password' })
}).then(res => res.json()).then(data => console.log(data));
```

Upon hitting enter, you will see that we get our `failed login` error message... so perfect! 

Now we are going to move on to the `logout feature` ....

# USER LOGOUT API ROUTE
--------------------------------------------------------------------------------------------------------

So this is a little bit more straightforward, the code below is our endpoint for logging out : 

backend/route/api/session.js
```js
// ...

// Log out
router.delete(
    '/',
    (req, res) => {
        res.clearCookie('token');
        return res.json({ message; 'success' });
    }
);

// ...
```

So, if the presence of a `token` means that a `user` is logged in then the absence of that `token` means that the `user` is logged out!
So, to log out a user, we just need to remove that `token` from the response. 
So we are going to use that `clearCookie` method which is built in/part of `Express` to remove the `cookie` denoted as the `token`. 
Let's go ahead and throw this in our code here so we can test this out : 

backend/routes/api/session.js
```js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router(); 


module.exports = router; 
```

Next, we are going to add in our `POST` route :

backend/routes/api/session.js
```js
const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router(); 

// Log in 
router.post(             
    '/',
    async (req, res, next) => {
        const { credential, password } = req.body;  
        const user = await User.unscoped().findOne({ 
            where: {
                [Op.or] {                    
                    username: credential,  
                    email: credential       
                }                           
            }                               
        }); 
    
    if (!user || !brcypt.compareSync(password. user.hashedPassword.toString())) {
        const err = new Error('Login failed'); 
        err.status = 401;
        err.title = 'Login failed';
        err.errors = { credential: 'The provided credentials were invalid.' }; 
        return next(err);
    }

    const safeUser = { 
        id: user.id,
        email: user.email,
        username: user.username
    }; 

    await setTokenCookie(res, safeUser);

    return res.json({
        user: safeUser
    }); 
    }

); 

// Log out
router.delete(
    '/',
    (req, res) => {
        res.clearCookie('token');
        return res.json({ message; 'success' });
    }
);

module.exports = router; 
```

--------------------------------------------------------------------------------------------------------

Let's go ahead and test the Logout Route!

--------------------------------------------------------------------------------------------------------

Let's start by navigating to : 

>> localhost:8000/api/csrf/restore

To grab our `token`, then...

Try to logout the session user : 

```js
fetch('/api/session', {
    method: 'DELETE',
    headers: {
        "Content-Type": "application/json",
        "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
    }
}).then(res => res.json()).then(data => console.log(data));
```

But first we need to make sure we are `logged in` before pasting the above `fetch` request : 

Log in first (so paste this into the console) :

```js
fetch('/api/session', {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "XSRF-TOKEN": `<value of XSRF-TOKEN cookie here>` // token should be the same for login and logout
    },
    body: JSON.stringify({ credential: 'Demo-lition', password: 'password' }) // correct credentials
}).then(res => res.json()).then(data => console.log(data));
```

Log out user : 

```js
fetch('/api/session', {
    method: 'DELETE',
    headers: {
        "Content-Type": "application/json",
        "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>` // same token pasted as login 
    }
}).then(res => res.json()).then(data => console.log(data));
```
If you check your cookies in `Applications` you will see you are missing the `token` cookie so the `clearCookie` method worked and it all runs smoothly! 

The testing might seem a bit obnoxious and redundant but testing all of this now will save you headaches down the road!

# USER SIGNUP API ROUTE
--------------------------------------------------------------------------------------------------------

>> Currently our `backend/routes/api/users.js` file looks like this : 

backend/routes/api/users.js
```js
const express = require('express');
const router = express.Router(); 

module.exports = router; 
```

>> Import the following code at the top of the file and create an Express router: 

backend/routes/api/users.js
```js
const express = require('express');
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth'); // our helper functions and requireAuth middleware
const { User } = require('../../db/models');                         // our User model 

const router = express.Router(); 

module.exports = router; 
```

Next, we will add the `POST` `/api/users` route to the router using an asynchronous route handler. In the route handler, deconstruct the request body, then use `bycrypt's` `hashSync` function to hash the user's provided password to be saved as the user's `hashedPassword` in the database. Create a new `User` in the database with the `username` and `email` from the request body and the `hashedPassword` generated from `bcryptjs`. 

Then, use `setTokenCookie` to log in the user by creating a JWT cookie with the user's non-sensitive information as its payload. 

Finally, send a JSON response containing the user's non-sensitive information. Here is what the format of the JSON response should look like if the user is successfully created in the database : 

```js
{
user: {
    id, 
    email, 
    username
}
}
```

So this is our `signup` route : 

backend/routes/api/users.js
```js
const express = require('express');
const bcrypt = require('bcryptjs'); // importing bcrypt here

const { setTokenCookie, requireAuth } = require('../../utils/auth'); 
const { User } = require('../../db/models');                         

const router = express.Router(); 

router.post(
    '/',
    async (req, res) => {
        const { email, password, username } = req.body; // So we are taking in an email, password, and username in our request body
        const hashedPassword = bcrypt.hashSync(password); // we are going to throw that plain text password into a brcpt hash method
        const user = await User.create({ email, username, hashedPassword }); // then passing the email, the username, and hashedPassword 
        // into our create method. Signing up and creating that user : 

        const safeUser = { 
            id: user.id,
            email: user.email,
            username: user.username
        }; // only passing in the id, email, username, certainly not our password. 

    await setTokenCookie(res, safeUser); // and we are going to pass that user object into our setTokenCookie function to generate a JWT and sign this user in. 

    return res.json({   // and then just sending back that user data in our response
        user: safeUser
    });

    }
);

module.exports = router; 
```

--------------------------------------------------------------------------------------------------------

Let's go ahead and test the SignUp Route!

--------------------------------------------------------------------------------------------------------

Let's go ahead and restore our csrf token : 

>> localhost:8000/api/csrf/restore

You are pretty much going to need to do that anytime your server restarts so keep that in mind. 

And here is our sign-up `fetch` : 

```js
fetch('api/users', {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
    },
    body: JSON.stringify({
        email: 'spidey@spider.man',
        username: 'Spidey',
        password: 'password'
    })
}).then(res => res.json()).then(data => console.log(data));
```

We will go ahead and test our `unique` constraints on our database but we will be doing a lot more testing in the next phase. 

So let's paste in our `fetch` in our console and grab our `csrf-token` and hit send

And we can see we are able to sign up a `user` and we should have a `new token` in our `Applications`

So let's change our `username` and use the same email address : 

```js
fetch('api/users', {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
    },
    body: JSON.stringify({
        email: 'spidey@spider.man',
        username: '1Spidey',            // changed our username
        password: 'password'
    })
}).then(res => res.json()).then(data => console.log(data));
```

Now when we hit enter we should see that we are getting a validation error message, saying `email must be unique`

If we try this again with a `unique email address` and an already used `username` : 

```js
fetch('api/users', {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "XSRF-TOKEN": `<value of XSRF-TOKEN cookie>`
    },
    body: JSON.stringify({
        email: '1spidey@spider.man',   // unique email address 
        username: 'Spidey',            // already used username
        password: 'password'
    })
}).then(res => res.json()).then(data => console.log(data));
```

We get a validation error that says `username must be unique` so perfect! So those validations are working well. Again, we will add some more server level validation with the next exercise but as far as our database constraints go that is sufficient for now. 

With the sign up route set up, our last step here is to set up a `route` just to fetch the `logged in user's information`

--------------------------------------------------------------------------------------------------------

Get Session User API Route

--------------------------------------------------------------------------------------------------------

backend/routes/api/session.js
```js
// ...

// router.delete 

// Throwing this code below our logout route:
// Restore session user 
router.get(
    '/',
    (req, res) => {
        const { user } = req; 
        if (user) {
            const safeUser = {
                id: user.id,
                email: user.email,
                username: user.username
            }; 
        return res.json({
            user: safeUser
        });
        } else return res.json({ user: null });
    }
);

// ...
```

So what we are doing is checking to see if we have a `user` on our request object. So if we have passed through that `restore user global middleware` and found a user identified by the JWT and applied that user to our request object, we are going to check to make sure that we do have a user, and if we do, we will go ahead and send back just the `id`, `email`, and `username` of that user. If we do not, then we are just going to send back `null`. 

So let's go ahead and test this out here. This is just going to be a `GET` request : 

>> localhost:8000/api/session

So we get back our `Spidey` information here and if we remove our `cookie` in `Applications` we should get back `null`. So perfect that is the desired outcome! 

That will wrap up Phase 4! 

# END OF PHASE 4 ( USER AUTH ROUTES )
--------------------------------------------------------------------------------------------------------

