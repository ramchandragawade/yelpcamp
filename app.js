if(process.env.NODE_ENV!='production'){
    require('dotenv').config();
}
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const path = require('path');
const passport = require('passport');
const helmet = require('helmet');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const session = require('express-session');
const flash = require('connect-flash');
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user');
const MongoStore = require('connect-mongo');
const port = process.env.PORT || 3001;

const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
mongoose.connect(dbURL);
const db = mongoose.connection;
db.on('error',console.error.bind(console, 'Connection error'));
db.once('open', ()=>{
    console.log('Database connected');
});

const app = express();

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://cdn.jsdelivr.net",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/duhlvrita/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60
});

store.on('error', function (e) {
    console.log('Session store err:',e);
})

const sessionCfg = {
    name: 'sesh',
    store,
    secret: process.env.SESSION_CFG_SECRET,
    resave:false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionCfg));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Set routers
app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);

// Home route
app.get('/', (req, res) => {
    return res.render('home');
});

// Error handler
app.all('*',(req,res,next)=>{
    next(new ExpressError('Page not found!!!',404));
});
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message)
        err.message = 'Something went wrong';
    console.log(err);
    res.status(statusCode).render('error', { err });
});

app.listen(port, function () {
    console.log(`Serving on port ${port}`);
})