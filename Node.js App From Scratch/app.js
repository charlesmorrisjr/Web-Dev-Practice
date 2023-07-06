const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');

// Load config
dotenv.config({ path: './config/config.env' });

// Passport config
require('./config/passport')(passport)

connectDB();

const app = express();

// Body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Handlebars Helpers
const { formatDate, truncate, stripTags, editIcon } = require('./helpers/hbs');

// Handlebars
const hbs = exphbs.create({
  extname      :'hbs',
  layoutsDir   : 'views/layouts',
  defaultLayout: 'main',
  helpers      : { formatDate, truncate, stripTags, editIcon },
  // partialsDir  : [
  //     ''
  // ]
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// Express Sessions
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global express var
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
