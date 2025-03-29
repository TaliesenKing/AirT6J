# PHASE 0 ( THE SET UP ) 
------------------------------------------------------------------------------------------------

- We are going to set up the authenticate me project skeleton for the MOD 4 project
- Keep in mind this is only the backend half of the authenticate me code!

# SETUP YOUR REPOSITORY
------------------------------------------------------------------------------------------------

Structure of the repo 

- At the root of the project skeleton, we have a: 

    1. backend folder
    2. frontend folder
    3. .gitignore
    4. README.md


This needs to be the initial structure for your repository. This stuff CANNOT be nested further into another folder. This is what your primary repository page should look like 

Keep in mind github does not track empty folders so in both of the backend and frontend folders, I have kept a .keep file for the sake of pushing but feel free to remove those files once those folders have been filled with content/files.

Let's take a look at our .gitignore file : 

```.gitignore
node_modules
.env
build
.DS_Store
*.db
```

Let's take a quick look at our .gitignore. Just some files we don't want to push up to our github repo. Like our .env file where we are storing some potentially sensitive information like SECRET KEYS, our node_modules and our local sqlite3 databse. 

Let's take a look our Phase 0: 

First and foremost, we are going to need to initialize node. 

- So let's cd into our backend folder and the run : 
        
    >> npm init -y

So this is a pretty lengthy list of npm packages 
Really most of what we will be using : 

- `cookie-parser` - parsing cookies from requests

^ Allowing us to parse and read and access cookies that are coming in as headers 
for the requests

Some security packages
- `cors` - CORS
- `csurf` - CSRF protection


- `dotenv` - load environment variables into Node.js from a `.env` file

^ Making sure we can read our environmnet variables 

Some Express stuff here 
- `express` - Express
- `express-async-errors` - handling `async` route handlers


- `helmet` - security middleware
^ Some extra layers of security 

- `jsonwebtoken` - JWT

^ This will let us create those JWTs that we will need down the line 

- `morgan` - logging information about server requests/responses

^ This package here just prints some stuff to our terminals so we can see some information 
about the requests that are coming in 


- `per-env` - use environment variables for starting app differently

^ A package we are going to use in the start script for our application. 
This package just helps us determine one environment we are running in when we do boot up our server and then allows us to run different start up scripts depending on the result of that check. 


- `sequelize@6` - Sequelize
- `sequelize-cli@6` - use `sequelize` in the command line


- `pg` - use Postgres as the production environment database

^ This is what is going to allow us to interact with Postgres
Postgres is the RDBMS that we are going to be using on the production side of our application 


Then we have a few packages that are going to be installed on the development side that are not going to be necessary in production: 

`npm install -D` the following packages as dev-dependencies:

- `sqlite3` - SQLite3

- `dotenv-cli` - use `dotenv` in the command line

^ Which can be particularly useful for a few individuals who happen to have issues with the dotenv package which is an issue a few people tend to run into. 

- `nodemon` - hot reload server `backend` files

^ And then of course the nodemon package which we will be using quite a bit of in the development of our application so that our server continually reboots when we make changes to our code. 

So that is all the packages we are going to need to install for the time being! 

So we go into our backend server folder and run the command : 

npm install cookie-parser cors csurf dotenv express express-async-errors etc(separated by spaces)

then run : 

npm install -D sqlite3 dotenv-cli nodemon 

# CONFIGURATION 
------------------------------------------------------------------------------------------------


Let's take a look at configuration. So in the backend folder, by the way, there are a lot of files we are going to be creating and a lot of code we are going to be adding into this code base. So check to make sure that where you are putting this stuff is in the correct spot. We put things in the wrong place, things are going to break. So one thing we should be doing is frequently testing the code base whenever possible just to make sure that all of those steps that we are taking are working in sync. 

So let's start in the backend folder we are going to create a .dotenv file 

```plaintext
.
|-- backend/
  |-- node_modules/
  |-- .env
  |-- package-lock.json
  |-- package.json
|-- frontend/
|-- images/
|-- .gitignore
|-- README.md 

```

Let's get started by pasting the code provided in the authenticate me startup into our .env file : 

``` .dotenv file 
PORT=8000           // setting our port variable 
DB_FILE=db/dev.db   // path to our local database file
JWT_SECRET=<<generate_strong_secret_here>>      // we will need a secret value here
JWT_EXPIRES_IN=604800                           // the length of time it will take for a JWT to expire that we create 
SCHEMA=<<custom_schema_name_here>>              // Revisit this 
```

- Next, we will create a Javascript configuration file that will read the environment variables so this file is going to be meant for just extracting these environment variable values from our .dotenv file and exporting them for use throughout the rest of our application. So we are going to want a config folder in our backend folder and then an index.js file in that folder. 

```plaintext
.
|-- backend/
  |-- config/
    |-- index.js 
  |-- node_modules/
  |-- .env
  |-- package-lock.json
  |-- package.json
|-- frontend/
|-- images/
|-- .gitignore
|-- README.md 

```

So then inside our backend/config/index.js : 

```js

module.exports = {
    environment: process.env.NODE_ENV || 'developmnet',
    port: process.env.PORT || 8000,
    dbFile: process.env.DB_FILE, 
    jwtConfig: {
        secret: process.env.JWT_SECRET, 
        expiresIn: process.env.JWT_EXPIRES_IN
    }
}; 
```

So now all of those variables that we just set in our .env file, the exception of that schema property so far, is all being extracted here with that `process.env` and then export it, again, so we can use these variables as data elsewhere in our code! 

So the next step is going to be to set up `Sequelize` so we will want to `npx sequelize init` but before we do that we want to create our `.sequelizerc` file to tell `Sequelize` where all of the new files and folders should go, so we will want to create that file in our `backend` folder. 

```plaintext
.
|-- backend/
  |-- config/
    |-- index.js 
  |-- node_modules/
  |-- .env
  |-- .sequelizerc
  |-- package-lock.json
  |-- package.json
|-- frontend/
|-- images/
|-- .gitignore
|-- README.md 
```

```backend/.sequelizerc/

const path = require('path');

module.exports = {
    config: path.resolve('config', 'databse.js'), 
    'models-path': path.resolve('db', 'models'), 
    'seeders-path': path.resolve('db', 'seeders'), 
    'migrations-path': path.resolve('db', 'migrations')
};
```

You have seen this code before. This is just a set of instructions to tell `Sequelize` where to generate and where to find certain files and folders. So now that we have this set up we can now run our `npx sequelize init` command and it should create the correct file and folder structure for us. 

So make sure you are in the backend folder and run: 

npx sequelize init 

So we now have a db folder and migrations, models, seeders subfolders in that db folder and a database.js file was created in our config directory.

```plaintext
.
|-- backend/
  |-- config/
    |-- database.js
    |-- index.js 
  |-- db/
    |-- migrations/
    |-- models/
    |-- seeders/
  |-- node_modules/
  |-- .env
  |-- .sequelizerc
  |-- package-lock.json
  |-- package.json
|-- frontend/
|-- images/
|-- .gitignore
|-- README.md 
```

In that config/database.js file we are going to find a bunch of pre-generated json for us and we will take all of that and get rid of that because we are not going to use that anymore. Instead, we will replace that by inserting the provided json in the README : 

```config/database.js 

const config = require('./index');

module.exports = {
    development: {
        storage: config.dbFile, 
        dialect: "sqlite", 
        seederStorage: "sequelize", 
        logQueryParameters: true, 
        typeValidation: true
    }, 
    production: {
        use_env_variable: 'DATABSE_URL', 
        dialect: 'postgres',
        seederStorage: 'sequelize',
        dialectOptions: {
            ssl: {
                require: true, 
                rejectUnauthorized: false
            }
        }, 
        define: {
            schema: process.env.SCHEMA
        }
    }
}; 
```

So the `development object` we have seen before we have discussed this previously when we first set up Sequelize. 
This `production object` is one that we have not seen before so this `production object` is what is going to be used by Sequelize for our project minutes in production. So some of the configuration for our database, our connection to the database is going to change depending on the environment we are working in. For instance, we are going to be using `Postgres` in production rather than sqlite. So some of the other settings we don't need to worry about. We are going to be accessing the database through an environment variable which we are going to define on `Render` which is the service that we will eventually be hosting this codebase on so we will get there around the end of this series of videos. 

The `schema` environment variable we will leave this alone for now. We will dive into what this schema is doing for us and its purpose once we start creating some tables in our database. So we will get there soon! 

# `psql-set-script.js` 
------------------------------------------------------------------------------------------------

```plaintext
.
|-- backend/
  |-- config/
    |-- database.js
    |-- index.js 
  |-- db/
    |-- migrations/
    |-- models/
    |-- seeders/
  |-- node_modules/
  |-- .env
  |-- .sequelizerc
  |-- package-lock.json
  |-- package.json
  |-- psql-setup-script.js
|-- frontend/
|-- images/
|-- .gitignore
|-- README.md 
```

And now we will copy and paste the code from the README into that file. 

`backend/psql-setup-script.js`
```js
const { sequelize } = require('./db/models'); 

sequelize.showAllSchemas({ logging: false }).then(async (data) => {
  if (!data.includes(process.env.SCHEMA)) {
    await sequelize.createSchema(process.env.SCHEMA);
  }
}); 
```
^ This will allow us to actually use that schema that we are going to set up. In this particular context, because Render only allows us to have a single database at a time, rather than an individual database for each project, we are going to create one database we use for all of our projects. 

So what we are going to want to do is kind of partition each of the databases for each individual project, so a `SCHEMA` is pretty much what that is. It is a partition between sections of our database to allow us to kind of mimic having multiple databases. It is just that we are creating "subdatabases" within one single database. But of course we are going to have different projects that all want, for instance, a 'Users' table. We are going to want those tables to be separate and to specifically relate to particular projects. Our 'Users' table for this MOD 4/5 project is going to contain different data and different 'user' information than the 'Users' table for your project in MOD 6 or your `capstone project` in MOD 5. 

So the `schema` is just that subdivision so we are going to define a schema as the particular section of the database that will be used by this project. So we will get into how to apply this to our `Sequelize` in seeders in just a little bit! But that is essentially what the `schema` is all about!

Now that we have all of this `Sequelize` stuff setup we have this command here (below) making sure that Sequelize creates an empty database file for us. It should create that `SequelizeMeta` table but that should be empty: 

>> npx dotenv sequelize db:migrate

^ Says 'no migrations were executed' so let's just jump into our database : 

>> sqlite3 db/dev.db 
>> .tables

So we see have a `SequelizeMeta` table there as expected. So Sequelize is set to go! 

# EXPRESS SETUP 
------------------------------------------------------------------------------------------------

So now on to setting up `Express`! So here we are going to want to create an `app.js` file in the backend directory: 

```plaintext
.
|-- backend/
  |-- config/
    |-- database.js
    |-- index.js 
  |-- db/
    |-- migrations/
    |-- models/
    |-- seeders/
  |-- node_modules/
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

And then we are given a nice, long list of `Imports` importing a bunch of those packages that we mentioned earlier on when we installed them. 

```js
const express = require('express'); 
require('express-async-errors'); 
const morgan = require('morgan'); 
const cors = require('cors'); 
const csurf = require('csurf'); 
const helmet = require('helmet'); 
const cookieParser = require('cookie-parser'); 
```

We want to import some information about our environment from the `config/index.js` file. In particular, what we are looking at is this property in that file : 

```js
module.exports = {
environment: process.env.NODE_ENV || 'development'
}
```

There are going to be some things that we want to operate a little bit differently depending on which environment we are working in. So this variable here... 

 const isProduction = environment === 'production'; 

is going to help us determine which environment we are in and allow us to kind of do some boolean logics that we can perform different processes depending on that environment. So let's go ahead and grab this and paste it below the rest of our `Imports`

backend/app.js: 
```js
const express = require('express'); 
require('express-async-errors'); 
const morgan = require('morgan'); 
const cors = require('cors'); 
const csurf = require('csurf'); 
const helmet = require('helmet'); 
const cookieParser = require('cookie-parser'); 

const { environment } = require('./config'); 
const isProduction = environment === 'production'; 

const app = express(); 

app.use(morgan('dev')); 
```
^ Next we are going to initialize the `Express` application by invoking the express package.

^ And below that we are going to app.use the `morgan middleware`. Again, this middleware's purpose is just to print a little bit of information about each of the requests that we are getting. 

^ Because this is `global middleware` we want this to appear near the top of our appplication BEFORE any of our actual endpoints. And the same for the rest of the `middleware` that we are going to be putting in here! 

We also want to be able to read our `cookies` from the __headers__ of our __requests__ and `parse` those JSON bodies so we will include the `cookie-parser` middleware and `express.json` moddleware for parsing JSON bodies of requests with `Content-Type` of `'application/json'` : 

backend/app.js: 
```js
const express = require('express'); 
require('express-async-errors'); 
const morgan = require('morgan'); 
const cors = require('cors'); 
const csurf = require('csurf'); 
const helmet = require('helmet'); 
const cookieParser = require('cookie-parser'); 

const { environment } = require('./config'); 
const isProduction = environment === 'production'; 

const app = express(); 

app.use(morgan('dev')); 
app.use(cookieParser());
app.use(express.json());
```

Next, we are going to set up our basic `security middleware`. So first, we are going to check if we are in the `production environment` and if we are not, we will go ahead and set up our `cors` here and we are using that `helmet` package for a little bit of extra `cors` security. And then our `csurf` package to protect us against `csurf` attacks. We want to make sure that when we eventually create __endpoints__ that the __endpoints__ are placed below all of this middleware. We need all of our requests to pass through that large chunk of global middleware: 

backend/app.js: 
```js
const express = require('express'); 
require('express-async-errors'); 
const morgan = require('morgan'); 
const cors = require('cors'); 
const csurf = require('csurf'); 
const helmet = require('helmet'); 
const cookieParser = require('cookie-parser'); 

const { environment } = require('./config'); 
const isProduction = environment === 'production'; 

const app = express(); 

app.use(morgan('dev')); 
app.use(cookieParser());
app.use(express.json());

// Security Middleware : 
if (!isProduction) {
  //enable cors only in DEVELOPMENT 
  app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
  })
); 

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction, 
      sameSite: isProduction && "Lax", 
      httpOnly: true
    }
  })
);
```

# ROUTES 
------------------------------------------------------------------------------------------------

So, next we are going to create a `routes` folder. So all of those endpoints, we don't want to be putting in our `app.js` so we are going to be creating a number of `routers`. And in that folder, we are going to create an `index.js` file. This file is going to be an initial hub for all of our requests. We will be putting in some nested folders and files here for the rest of our actual enpoints but we will use this file for a little bit of testing! 

```plaintext
.
|-- backend/
  |-- config/
    |-- database.js
    |-- index.js 
  |-- db/
    |-- migrations/
    |-- models/
    |-- seeders/
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

`routes/index.js`
```js
const express = require('express'); 
const router = express.Router(); // creating a router from our express package up above

router.get('/hello/world', function (req,res) {   // setting up a quick little endpoint to test that we are able to get some
  res.cookie('XSRF-TOKEN', req.csrfToken());      // csrf tokens
  res.send("Hello World!");
}); 

module.exports = router; 
```

So now that is in here, we are going to need to `IMPORT` this __router__ into `app.js` so let's hop back into there and add it where the rest of the `imports` exist and connecting the exported route to `app` after all the `middelware` : 

`backednd/app.js`
```js
const express = require('express'); 
require('express-async-errors'); 
const morgan = require('morgan'); 
const cors = require('cors'); 
const csurf = require('csurf'); 
const helmet = require('helmet'); 
const cookieParser = require('cookie-parser'); 

const { environment } = require('./config'); 
const isProduction = environment === 'production'; 

const routes = require('./routes');               // adding the routes to the Express application where are imports exist 

const app = express(); 

app.use(morgan('dev')); 
app.use(cookieParser());
app.use(express.json());

// Security Middleware : 
if (!isProduction) {
  //enable cors only in DEVELOPMENT 
  app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
  })
); 

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction, 
      sameSite: isProduction && "Lax", 
      httpOnly: true
    }
  })
);

// app.use(routes); <- Again, we want to make sure all of our requests pass through all this global middleware up top so this will go at the bottom of it all
app.use(routes); 

// We are going to be exporting our app object and using a script file for actually starting up our applications. So we are going to need access to the app object to do that so let's add that export below our routes: 
module.exports = app; 
```

# CREATE THE SERVER 
------------------------------------------------------------------------------------------------

And with that set up, we are going to create that `script file`! So we are going to create a new folder called `bin` and in that folder, a new file called `www`. This is just a `script file`!

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

Now in this `www` file we are going to paste in the following code : 

backend/bin/www 
```js
#!/usr/bin/env node    // This is just allowing us to execute this file as a executable script 

// Import environment variables 
require('dotenv').config();       // We are importing that dotenv package to allow us to read our environment variables

const { port } = require('../config');  // importing our port environment variable from that config/index.js file 

const app = require('../app');          // importing our app object 
const db = require('../db/models');     // and also our db object from the sequelize models index directory 

// We are using that db object to attempt to authenticate and connect to our database. 

// Check the database connection before starting the app
db.sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection success! Sequelize is ready to use...');

// And as long as we are able to successfully connect to our database we will boot up our server or print out an error 

    // Start listening for connections
    app.listen(port, () => console.log(`Listening on port ${port}...`));
  })
  .catch((err) => {
    console.log('Database connection failure'); 
    console.error(err);
  }); 
```

# TEST THE SERVER 
------------------------------------------------------------------------------------------------

In your `package.json`, we are going to need to create some scripts so that we can boot up our server and test to make sure that all of this work is actually functioning! 

replace the scripts object with the code provided: 
backend/package.json
```plaintext
"scripts": {
  "sequelize": "sequelize", 
  "sequelize-cli": "sequelize-cli", 
  "start": "per-env",
  "start:development": "nodemon ./bin/www",
  "start:production": "node ./bin/www",
  "build": "node psql-setup-script.js"
},
```

The important scripts for make sure to keep in mind for the moment, first of all, `npm start` is using that `per-env` package that we mentioned in the beginning of this video because `per-env` package is just going to determine what environment we are running in. And then it is going to execute a new script depending on which environment it finds. So if we are in the __development__ environment we will run `nodemon` and then that script file, otherwise we will just run that script file using `node`. 

This `build` script is what Render is going to eventually use to kinda start up our application or do some necessary configuration on the backend of the production server there. 

With that script in place, let's try starting up our server : 

cd into backend and run : 

>> npm start 

So that `per-env package` determined that we are running in the __development environment__ so it ran our start development script and booted up our server using `nodemon`. Again, we attempted to connect to the database which looks like it was successful and then started our server on port 8000 (the port number we defined in the `dotenv` file). 

So with that done, we want to test that the one endpoint we have is working properly and the goal of that test endpoint is just to make sure that our csrf tokens are working : 

`routes/index.js`
```js
const express = require('express'); 
const router = express.Router(); // creating a router from our express package up above

router.get('/hello/world', function (req,res) {   // setting up a quick little endpoint to test that we are able to get some
  res.cookie('XSRF-TOKEN', req.csrfToken());      // csrf tokens
  res.send("Hello World!");
}); 

module.exports = router; 
```

So in browser we see : "Hello World!" 

>> INSPECT THE PAGE -> GO TO APPLICATION -> GO TO COOKIES -> WE SEE THE XSRF-TOKEN WITH A VALUE!

In the terminal you can see more information : 

Listening on port 8000... 
GET /hello.world 304 
GET /favicon.ico 404 

The browser is just looking for a favicon and not finding one but we will eventually adding a favicon to the code but nothing to worry about in MOD 4 

The 304 is the request we sent from the browser.  

# CSRF TOKEN ACCESS FOR DEVELOPMENT 
------------------------------------------------------------------------------------------------

Now we are going to set up another endpoint here. This is actually going to be the endpoint that we use somewhat regularly to make sure that we have an updated csrf token for the requests that we are making. So, let's hop into the routes/index.js and we can remove that prior test route but let's just comment it out for now : 

`routes/index.js`
```js
const express = require('express'); 
const router = express.Router(); // creating a router from our express package up above

// router.get('/hello/world', function (req,res) {   // setting up a quick little endpoint to test that we are able to get some
//   res.cookie('XSRF-TOKEN', req.csrfToken());      // csrf tokens
//   res.send("Hello World!");
// }); 

// Add a XSRF-TOKEN cookie
router.get("/api/csrf/restore", (req, res) => {
  const csrfToken = req.csrfToken(); 
  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).json({
    'XSRF-Token': csrfToken
  });
});

module.exports = router; 
```

^ You will notice that all of our requests from now on are going to start with `/api` so all of our endpoints that we create for things like `spots` or `groups`, those paths are really going to be `/api/spots` or `/api/groups` etc. In this route, we are sending a cookie on the response with 'XSRF-TOKEN'. This router will not be available in production but we will worry about that down the road. Let's make sure we can hit this endpoint using `Postman`. 

so GET localhost:8000/api/csrf/restore 

and we get ourselves back that 'XSRF-TOKEN'! 

# END OF PHASE 0 ( THE SET UP ) 
------------------------------------------------------------------------------------------------















