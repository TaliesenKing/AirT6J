# PHASE 3 ( USER AUTHENTICATION )
--------------------------------------------------------------------------------------------------------

Welcome to Phase 3! This phase is going to take us through something up to the `Users` table and `User` model, with some few `User` seed data points. And also getting started with our `User Authentication`. We are going to be setting up some `middleware` and `helper functions` to help us out with our User Auth Workflow. 

So your first step will be to install the `bcrypt` package (which we will be using to `hash` passwords) in the backend folder : 

>> npm install bcryptjs

Should be listed in your package-json. 

Let's get started by creating our `Users` table. So our users are going to give us a `username` `email` and `password` which we are going to `hash` and store as a `hashed password value`. So, we need to generate a model and migration for this table : 

>> npx sequelize model:generate --name User --attributes username:string,email:string,hashedPassword:string

So let's go ahead and give this a run and again make sure you are in the `backend folder` before running that! 

So let's take a look at our migration and model and we have no seeder yet. 

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
      |-- 20230316171729-create-user.js
    |-- models/
      |-- index.js
      |-- user.js
    |-- seeders/
      |-- 20230316171729-demo-user.js
  |-- node_modules/
  |-- routes/
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

# USER TABLE MIGRATION 
--------------------------------------------------------------------------------------------------------

So the first thing we are going to do is make some adjustments to the migration file to put in a little bit of database constraints and also set this file up to properly use our database in `Render`. So let's talk a little about this `options` object and that condition up at the top. 

For `Render`, it only allows us to have a single databse to use for all of our applications, which can present some problems right, each of our different applications is going to, for instance, have its own `Users` table containing its own User data, its own User column and constraints, specific to any given application, so, because we want multiple instances, multiple sections of a database, we are using a `SCHEMA` which is essentially a sub division of a database. We can use this `schema` property within databases to essentially create sub databses within that database. So, `Render` gives us one database, but we are going to use `schemas` to kinda isolate the tables and data that belong to each individual application. So that is why we have that `options` object over here in our migration file and is a really important part of our applications using `Render` and being hosted on `Render`. 

So, for `Sequelize` all of our `queryInterface` methods that we use for any of our migrations or any of our seeders, they are ALL GOING TO USE THIS `OPTIONS` OBJECT WITH THE `createTable` METHOD. For any migration that is using the `createTable` method, that `options` object is going to be passed in as the last argument to this method call. 

backend/db/migrations/user.js
```js
'use strict';

let options = {}; 
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {     
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: true
      },
      hashedPassword: {
        type: Sequelize.STRING.BINARY,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);                                // listing the options object (important)
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Users";
    return queryInterface.dropTable(options);// we are going to pass that `options` object in as the FIRST argument to those method calls. 

  }
};
```

^ So we are passing in the table name `Users`, an object listing all of the `columns` and then finally after that object, we are going to list that `options` object we created. 

So that is going to be the same for EVERY SINGLE `createTable` migration. For every other `queryInterface` method, whether it's dropping a table, inserting data, adding an index or column or any of those, we need to add a `tableName` property to that `options` object pointing to a value to a table name and then we are going to pass that `options` object in as the FIRST argument to those method calls. 

So again for `createTable` we pass the `options` object in as the LAST ARGUMENT. 
For EVERY OTHER `queryInterface` METHOD, we pass that `options` object as the FIRST ARGUMENT INSTEAD OF A STRING OF THE `tableName`

Now before we move on to adjusting our `model` file, let's do a bit of testing to see if everything works out fine. 

Let's make sure we can migrate that file without any error: 

>> npx dotenv sequelize db:migrate

Command to undo the migration/drop that table : 

>> nox dotenv sequelize db:migrate:undo

Make sure to migrate it again : 

>> npx dotenv sequelize db:migrate

You can check out the `Users` table schema created in your SQLite3 database by running the following command in the terminal : 

>> sqlite3 db/dev.db ".schema Users"

# USER MODEL 
--------------------------------------------------------------------------------------------------------

Now we are going to take a look at our model! So we will add a bit of data validation here. For example, we are going to test the length of the `username` we are given and make sure it is NOT an email address, that the username we are given is something other than a string in email format. 

Then, we are also going to check the length of the `email` and follows the expected email format. 

Then, we are going to be storing the `hashedPassword` which because we know the length of the `bcrypt` output is ALWAYS going to be 60 characters, so we can put in a validation saying the length of that value should always be 60 characters (len : [60, 60]). 

backend/db/models/user.js
```js
'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error('Cannot be an email.');
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 256],
          isEmail: true,
        },
      },
      firstName: {  // New field
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 50], // adjust the length as needed
        },
      },
      lastName: {  // New field
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 50], // adjust the length as needed
        },
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60],
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt'],
        },
      },
    }
  );
  return User;
};
```

# USER SEEDS 
--------------------------------------------------------------------------------------------------------

Let's go ahead and set up some seed data. So let's generate a seed file : 

>> npx sequelize seed:generate --name demo-user

backend/db/seeders/demo-user.js
```js
'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password')
      },
      {
        email: 'user1@user.io',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        email: 'user2@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3')
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] }
    }, {});
  }
};
```

^ So again, we are creating this `options` object and passing that `options` object in as the FIRST ARGUMENT TO OUR `bulkInsert` method. Again, ANY NON`createTable`METHODS, we are passing that `options` object in FIRST, defining our `tableName` property on that `options` object and we will be doing the same thing in the `down` function as well! 

So this is the point at which we are stating to use `bcrypt` these seed data points that we are creating, we are `hashing` the passwords using that `bcrypt package` so when we take a look at the data in our database, we should see that we do have users that we are storing big ol' `hash` content instead of plain old text passwords. 

And now let's go ahead and give this a run : 

>> npx dotenv sequelize db:seed:all

And let's hop back into our database and query our `Users`. 

>> backend % sqlite3 db/dev.db
>> SELECT * FROM Users;

And we can see we have our user `hashed passwords`! So that is looking good. 

You can test to see if you can roll back your seeds so let's go ahead and do that.  

>> npx dotenv sequelize db:seed:undo:all

And when we roll these back, if we want to recreate these Users we should also roll back our migrations. So our ids start back at 1 : 

>> npx dotenv sequelize db:migrate:undo

Then go ahead and re-migrate : 

>> npx dotenv sequelize db:migrate

And then make sure to re-seed : 

>> npx dotenv sequelize db:seed:all

Check : 

>> sqlite3 db/dev.db 'SELECT * FROM "Users"'

# MODEL SCOPES - PROTECTING USERS' INFORMATION 
--------------------------------------------------------------------------------------------------------

So the next thing we are going to do, is just add a simple `scope` to our `User` model. That `scope` is going to be a default scope that excludes some often unnecessary properties from our `User` model, INCLUDING and ESPECIALLY the `hashed password`. We DO NOT WANT to accidentally be exposing that to the __client__ or accidentally sending that along with any of our responses. So we are setting up `default scope` to EXCLUDE that property `hashedPassword` and some other things like `email`, `createdAt`, `updatedAt`. Things we don't necessarily want to send to the client or just values that we don't need that can kinda clog up out output a little bit. So that is the update we are making to our model : 

backend/db/model/user.js
```js
'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error('Cannot be an email.');
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 256],
          isEmail: true,
        },
      },
      firstName: {  // New field
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 50], // adjust the length as needed
        },
      },
      lastName: {  // New field
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 50], // adjust the length as needed
        },
      },
      hashedPassword: {
        type: DataTypes.STRING.BINARY,
        allowNull: false,
        validate: {
          len: [60, 60],
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {                                                       // setting defaultScope
        attributes: {                                                       // to exclude the following attributes 
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt'],   // passwords, important/senstive info and things we don't need 
        },
      },
    }
  );
  return User;
};
```

That should be all we need for our `User` table and model! 

# AUTHENTICATION FLOW 
--------------------------------------------------------------------------------------------------------

So let's talk through the `authentication flow` that we will be building out here. 

So, for logging in a user, we are going to need a `login` endpoint, route that will be hit with a `request body`. It is going to contain a `credential property` with a value of EITHER a `username` or `email` (depending on what the user wants to choose) and `password` combination. 

Then we are going to `query` our database for a `user` using the credentials. Then we are going to compare the `hashedPassword` in our databse with the `plain text password` that the `user` gives us using the `bcrypt compare method` then as long as we don't encounter any errors with that process, we will generate a new JSON Web Token and send that token along with some user information back to the __client__.

Similarly, for sign-up, we are going to take in a request that contains a `username` AND an `email` and a `plain text password`. We will create a new user record with the username, email, and a `hashed` version of that password so of course will be using `bcrypt` to hash that password string. Then, assuming we don't encounter any errors with that record creation process, we will generate a JSON Web Token and send that token and some user data back and a response back to the __client__. 

For logging out, that process will really just be removing the `token cookie` from the response. So we will set up an `endpoint` to remove the cookie and that will be our `logout`!

So let's get started with our `User Authentication` we will be setting up some `middleware` and `helper function` to help keep our code `DRY`. 

# USER AUTHENTICATION MIDDLEWARES 
--------------------------------------------------------------------------------------------------------

So we are going to start by building a `utils` folder in our `backend` folder and an `auth.js` file in `utils` : 

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
      |-- 20230316171729-create-user.js
    |-- models/
      |-- index.js
      |-- user.js
    |-- seeders/
      |-- 20230316171729-demo-user.js
  |-- node_modules/
  |-- routes/
    |-- index.js
  |-- utils/
    |-- auth.js
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

In that file, we are going to import a few things: We are going to import our `JSON Web Token` package. If for any reason, you have not installed the `jsonwebtoken` just `npm install jsonwebtoken` then we are importing this `jwtConfig` object from our `configuration folder` and then, of course, our `User` model and then `deconstructing` the `jwtConfig` object to pull out the properties of that object : 

backend/utils/auth.js
```js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;
```

Let's take a look at that `config/index.js` folder/file and so this code below is the object we are importing. So we are importing a `secret` value and an `expiresIn` value from our environment variables which we do currently have set up in our `.env` file! 

backend/config/index.js
```js
    jwtConfig: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN
    }
```

# setTokenCookie (helper function)
--------------------------------------------------------------------------------------------------------

First thing we are going to set up is a `helper function` so this IS NOT GOING to be middleware. This is going to be a function that just generates a `jwt` for us and sets that `token` on our `response cookies`. 

backend/utils/auth.js
```js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
    // Create the token.
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,      // no password stuff!
    };
    const token = jwt.sign(
      { data: safeUser },
      secret,
      { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );
  
    const isProduction = process.env.NODE_ENV === "production";
  
    // Set the token cookie
    res.cookie('token', token, {
      maxAge: expiresIn * 1000, // maxAge in milliseconds
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction && "Lax"
    });
  
    return token;
  };
```

^ `const safeUser`: So this is going to be a function that takes in the `response` and a `user` object and just create a nice, safe object making sure we are not passing in things like the `plain text password` or the `hashedPassword` 

`const token = jwt.sign`: We are going to pass that in as the `payload` for our `jwt` which we are creating here with our `sign` method and of course passing in our `secret` value from our enviroment variables and our `expiresIn` value. 

`res.cookie('token, token)` and `return token`: Then we are setting that token as a cookie on the response and `returning that token` from the `const token = jwt.sign` function in case we maybe need that token for anything else! 

So, ^ this is what we will be using to generate and set our `tokens`, our `jwts` to `login` or `sign up` a user. So we will be implementing this in a couple of endpoints down the road. 

# restoreUser (middleware) GLOBAL MIDDLEWARE 
--------------------------------------------------------------------------------------------------------

We can move on to our first middleware that we are going to create, our `restoreUser`  middelware!

backend/utils/auth.js
```js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
    // Create the token.
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    const token = jwt.sign(
      { data: safeUser },
      secret,
      { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );
  
    const isProduction = process.env.NODE_ENV === "production";
  
    // Set the token cookie
    res.cookie('token', token, {
      maxAge: expiresIn * 1000, // maxAge in milliseconds
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction && "Lax"
    });
  
    return token;
  };

  const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    req.user = null;
  
    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
      if (err) {
        return next();
      }
  
      try {
        const { id } = jwtPayload.data;
        req.user = await User.findByPk(id, {
          attributes: {
            include: ['email', 'createdAt', 'updatedAt']
          }
        });
      } catch (e) {
        res.clearCookie('token');
        return next();
      }
  
      if (!req.user) res.clearCookie('token');
  
      return next();
    });
  };
  ```

^ `const restoreUser = (req, res, next)`: So this middleware taking in of course req, res, and next. First, we are deconstructing the `token` property from this `req.cookies` object. So we are going to check to see if we have a token, that is the `GOAL` of this `restoreUser` middleware. 

`return jwt.verify`: So we are going to verify and pass that `token` in our verify method along with our `secret` value so that we can verify that the `jwt` hasn't been tampered with and passing in our `callback function` so we can do a little bit of `error handling` but most importantly this little bit of code right here : 

```js
      try {
        const { id } = jwtPayload.data;
        req.user = await User.findByPk(id, {
          attributes: {
            include: ['email', 'createdAt', 'updatedAt']
          }
        });
      }
```

Before we get there, IF we encounter an `error` maybe if we don't have a `token` for instance, that is okay! We are not necessarily going to throw an error here, it just means that the user is logged out or at least not logged in, which is okay! We are going to have plenty of endpoints that allow a user who is not logged in, to send a request to that endpoint, so that is fine. That is why we are invoking `next` here in case we do encounter an `error`. That does not mean we need to halt anything and throw errors that just means the user is not logged in at the moment which is okay! So that is just some `error handling` just allowing a request to pass through if it is not logged in that is perfectly okay. 

BUT if we do have a `token` we are going to attmept to find a `user` whose information is contained in that `token` so we are just going to desconstruct the `id` property of the `jwt` that we create which will be the line at the top of the code ( id: user.id, ). That is going to be that `id` property. We are going to take that and throw it into a `findbyPk` method and specify we are looking for the `email`, `createdAt`, `updatedAt` atttributes. 

BUT, this is also going to give us the `username` the `id` of that record. What this is allowing us to do is kinda override the part of our scope here : 

backend/db/models/user.js
```js
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt'],
        },
      },
```

^ It will override those properties here so we can INCLUDE those in our `query` but continue to ignore the `hashedPassword` property. So...
we are querying for that `user` and the REALLY IMPORTANT THING that we are doing with the response from that `query` is assigning that object to our `req` oject. So we are creating a property called `user` on the `req` object and setting that whole property to the return value of our `query` : 

```js
        req.user = await User.findByPk(id, {
          attributes: {
            include: ['email', 'createdAt', 'updatedAt']
          }
        });
```

THIS IS REALLY IMPORTANT because down the road when we are working in our endpoints and we need some user information about the currently logged in user to, say, check whether or not the logged in user is allowed to perform a particular action like `delete` a record or `update` a record, etc. We can access the logged in user's information at `req.user` and COMPARE that user's id or username, etc.. to the user information that is associated with the record, this request is trying to delete or update, etc. SO THIS IS REALLY IMPORTANT. Any time in your endpoints when you want to access the logged in user's information JUST KEY INTO `req.user`. 

In the event that we are unable to find a `user` given the credentials and the `payload` we are going to REMOVE THAT TOKEN FROM THE RESPONSE : 

```js
catch (e) {
        res.clearCookie('token');
        return next();
      }
```

This would probably only really occur if somehow we `delete` a user while the `token` is still `active` on that __client__. So in that particular event we'll go ahead and just remove that `token` and then just allow the request to continue on as just a `logged out` request. 

`return next()`: And then of course at the very end, just invoke `next` because we want all requests to pass through this `middelware`.

THAT IS OUR NEXT IMPORTANT POINT:  This `restoreUser` middelware is `GLOBAL MIDDLEWARE` so we are going to be applying this to our ENTIRE APPLICATION! 

# requireAuth ( middleware ) NOT GLOBAL MIDDLEWARE 
--------------------------------------------------------------------------------------------------------

`requireAuth` is NOT global middleware. It will be middleware that we ONLY apply to SOME SPECIFIC ENDPOINTS. What we are doing in this middleware, we are checking to see if `req.user` is DEFINED. If we were able to verify out `jwt` and decode our `jwt payload` here and find a related user and assign it to `req.user`. If all of that process went correctly and smoothly then our `requireAuth` is going to identify that we have a `logged in user` and allow the request to pass on to whatever endpoint this middlware is protecting. BUT, IF WE DO NOT HAVE A LOGGED IN USER, and we have this middleware applied to the `endpoint` , that is an indication that a user HAS TO BE LOGGED IN TO ACCESS THAT ENDPOINT and we are going to throw an `error` if they are not logged in, telling them that they are required to log in! So this middlware is something you will import into any of your `router` files where you happen to need to protect a particular enpdoint from users who are NOT YET LOGGED IN. 

last middleware in our auth.js in utils folder : 
```js
  const requireAuth = function (req, _res, next) {
    if (req.user) return next();
  
    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
  }
```

By and large, this is typically going to be any `POST` routes, any `PUT` or `PATCH` route, `DELETE` routes, things that often require that the user who is trying to perform that action be allowed to perform that action. We are going to want to make sure that there is a logged in user to do those things. 

Awesome! So that is our `User Authentication Middleware`. Finally, we are going to export all that stuff in that file at the end of the file : 

```js
module.exports = { setTokenCookie, restoreUser, requireUser }; 
```

Final code in auth.js : 

```js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
    // Create the token.
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    const token = jwt.sign(
      { data: safeUser },
      secret,
      { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );
  
    const isProduction = process.env.NODE_ENV === "production";
  
    // Set the token cookie
    res.cookie('token', token, {
      maxAge: expiresIn * 1000, // maxAge in milliseconds
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction && "Lax"
    });
  
    return token;
  };

  const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    req.user = null;
  
    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
      if (err) {
        return next();
      }
  
      try {
        const { id } = jwtPayload.data;
        req.user = await User.findByPk(id, {
          attributes: {
            include: ['email', 'createdAt', 'updatedAt']
          }
        });
      } catch (e) {
        res.clearCookie('token');
        return next();
      }
  
      if (!req.user) res.clearCookie('token');
  
      return next();
    });
  };

  const requireAuth = function (req, _res, next) {
    if (req.user) return next();
  
    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
  }

module.exports = { setTokenCookie, restoreUser, requireAuth };
```

# TEST USER AUTH MIDDLEWARES 
--------------------------------------------------------------------------------------------------------

`setTokenCookie` : 

--------------------------------------------------------------------------------------------------------

Now we are going to do a little bit of testing. So... in our nested index.js file in the api folder in routes... : 

backend/routes/api/index.js 
```js
const router = require('express').Router(); 

router.post('/test'. (req, res) => {
    res.json({ requestBody: req.body });
})

module.exports = router; 
```

We are going to import our `setTokenCookie` helper function and our `User` model and go ahead and just hard-code in query for a user and try to create a `token` for that user : 

backend/routes/api/index.js 
```js 
const router = require('express').Router(); 

router.post('/test'. (req, res) => {
    res.json({ requestBody: req.body });
})

// GET /api/set-token-cookie
const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models'); 
router.get('/set-token-cookie', async (_req, _res) => {
    const user = await User.findOne({
        where: {
            username: 'Demo-lition'
        }
    }); 
    setTokenCookie(res, user); 
    return res.json({ user: user }); 
}); 

module.exports = router; 
```

Now let's boot up our server via `npm start` and we can hit this link : 

>> localhost:8000/api/set-token-cookie

To check to see whether or not we are able to login with this `user`. 

So we did get back a response in the browser: 

>> ("user": {"id":1, "username": "Demo-lition"})

Let's check to make sure we have a cookie by going to inspect -> application -> cookie -> `token`

So this `token` is our `jwt` so the presence of this token indicates that we ARE DEFINITELY LOGGED IN. 

We can delete that token, hit refresh (send another request), and it should create our `token` for us. Perfect! 

You can take that jwt information from the token cookie and copy and paste it to jwt.io and you can decode it! 

That is our user information. 

--------------------------------------------------------------------------------------------------------

`restoreUser` : 

--------------------------------------------------------------------------------------------------------

Next thing we are going to do is check our `restoreUser` middleware so let's go ahead and import that and add in this quick little testing endpoint : 

backend/routes/api/index.js 
```js 
const router = require('express').Router(); 
const { restoreUser } = require('../../utils/auth.js');

router.use(restoreUser);

router.post('/test'. (req, res) => {
    res.json({ requestBody: req.body });
})

// GET /api/set-token-cookie
const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models'); 
router.get('/set-token-cookie', async (_req, _res) => {
    const user = await User.findOne({
        where: {
            username: 'Demo-lition'
        }
    }); 
    setTokenCookie(res, user); 
    return res.json({ user: user }); 
}); 

// GET /api/restore-user
router.get(
    '/restore-user',
    (req, res) => {
        return res.json(req.user);
    }
);

module.exports = router; 
```

^ So let's go ahead and test this endpoint here : 

>> localhost:8000/api/restore-user

Now we should be able to see our user information : 

>> { "id":1,"username":"Demo-lition","email":"demo@user.io","createdAt":"time-stamp","updatedAt":"timestamp"}

So we do see that information for the user we logged in as. Now if we `delete` our `token` going into `Appplication` and hit this endpoint again we get back : 

>> null

Because... (see comments next to the `const restoreUser` middelware function) : 

backend/utils/auth.js
```js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
    // Create the token.
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };
    const token = jwt.sign(
      { data: safeUser },
      secret,
      { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );
  
    const isProduction = process.env.NODE_ENV === "production";
  
    // Set the token cookie
    res.cookie('token', token, {
      maxAge: expiresIn * 1000, // maxAge in milliseconds
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction && "Lax"
    });
  
    return token;
  };

  const restoreUser = (req, res, next) => { // ...we went through the restoreUser middleware
    // token parsed from cookies
    const { token } = req.cookies;       // which we did not have a token so...
    req.user = null;                     
  
    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
      if (err) {
        return next();
      }
  
      try {
        const { id } = jwtPayload.data; // we are not going to be able to decode a token and.. 
        req.user = await User.findByPk(id, {  // find a user because there is no information for us to use so... 
          attributes: {
            include: ['email', 'createdAt', 'updatedAt']
          }
        });
      } catch (e) {
        res.clearCookie('token');
        return next();
      }
  
      if (!req.user) res.clearCookie('token');
  
      return next();                    // since we don't have a token, we just invoke next and are moving on passed this middleware...
    });                                 // see section below for finished explanation....
  };

  const requireAuth = function (req, _res, next) {
    if (req.user) return next();
  
    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
  }

module.exports = { setTokenCookie, restoreUser, requireAuth };
```
And eventually winding up at this endpoint in backend/routes/api/index.js...
```js
// GET /api/restore-user
router.get(
    '/restore-user',
    (req, res) => {
        return res.json(req.user);
    }
);
```

... where you are sending back `null` because `req.user` is not defined because you were not able to find a user in your `restoreUser` middleware function. 

So we can check one more time by logging back in with our : 

>> localhost:8000/api/set-token-cookie

Then if we hit enter, we are back to showing our user information! 

So that is `restoreUser`

--------------------------------------------------------------------------------------------------------

`requireAuth` : 

--------------------------------------------------------------------------------------------------------

Next, we are going to check to make sure that the `requireAuth` middleware is properly working. So... let's add code into our routes/api/index.js file. SEE COMMENTS IN THE CODE BELOW FOR THE `requireAuth` endpoint : 

backend/routes/api/index.js
```js 
const router = require('express').Router(); 
const { restoreUser } = require('../../utils/auth.js');
const { requireAuth } = require('../../utils/auth.js'); // eventually going to get rid of this

router.use(restoreUser);

router.post('/test'. (req, res) => {
    res.json({ requestBody: req.body });
})

// GET /api/set-token-cookie
const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models'); 
router.get('/set-token-cookie', async (_req, _res) => {
    const user = await User.findOne({
        where: {
            username: 'Demo-lition'
        }
    }); 
    setTokenCookie(res, user); 
    return res.json({ user: user }); 
}); 

// GET /api/restore-user
router.get(
    '/restore-user',
    (req, res) => {
        return res.json(req.user);
    }
);

// GET /api/require-auth
router.get(
    '/require-auth',
    requireAuth,                // so we are applying our requireAuth middleware just to this specific route
    (req, res) => {
        return res.json(req.user); // so we should only be able to get back a response if we are logged in 
    }
);

module.exports = router; 
```

So we are currently logged in as far as our browser is concerned, so let's try this endpoint : 

>> localhost:8000/api/require-auth

So we are getting our user information we are getting our endpoint. BUT if we delete our `token` (i.e. logout) ... then we hit refresh on that link, we get "Authentication required" 

We were unable to query for a `user` which means when we hit our `requireAuth` middleware here in auth.js : 

```js
  const requireAuth = function (req, _res, next) {
    if (req.user) return next();                        // we did not meet this condition, so we did not invoke next, instead...
  
    const err = new Error('Authentication required');   
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);                                   // we threw this error ^ 
  }
```

And that is the basics of our `User Authentication`!

We will be adding in some endpoints for us rather than kinda this hard-coding, this is all really just for testing purposes. 
In a future phase, we will be adding in actual `endpoints` to do all this stuff! 

# END OF PHASE 3 ( USER AUTHENTICATION )
--------------------------------------------------------------------------------------------------------












