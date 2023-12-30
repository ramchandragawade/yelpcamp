const { campgroundSchema, reviewSchema } = require('./validationSchemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!!!');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// Campground Validator middleware
module.exports.validateCampground = (req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body);
    if(error) {
        console.log(error);
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// review validator middleware
module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        console.log(error);
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Check if user is author of camp
module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp.author.equals(req.user._id)){
        req.flash('error',`You don't have permission to update.`);
        return res.redirect(`/campgrounds/${id}`);        
    }
    next();
}

// Check if user is author of review
module.exports.isReviewAuthor = async(req,res,next)=>{
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error',`You don't have permission to delete.`);
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}