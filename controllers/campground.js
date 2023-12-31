const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken:mapboxToken});
module.exports = {

    // Campgroung index route
    index : async(req,res)=>{
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index', {campgrounds});
    },

    // New campground form route
    renderNewForm: (req,res)=>{
        res.render('campgrounds/new');
    },

    // Add New campground form submission route(POST)
    createCamp: async(req,res,next)=>{
        const geoData = await geoCoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();
        const newCamp = new Campground(req.body.campground);
        newCamp.images = req.files.map(f=>({url: f.path, filename: f.filename}));
        newCamp.author = req.user._id;
        newCamp.geometry = geoData.body.features[0].geometry;
        await newCamp.save();
        req.flash('success','Successfully added a new campground!');
        res.redirect('/campgrounds/'+newCamp._id);
    },

    // Show selected campground route
    showCamp: async(req,res)=>{
        const {id} = req.params;
        const camp = await Campground.findById(id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        if(!camp){
            req.flash('error','Campground not found!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show', {camp});
    },

    // Edit campground form route
    renderEditForm: async(req,res)=>{
        const { id } = req.params;
        const camp = await Campground.findById(id);
        if(!camp){
            req.flash('error','Campground not found!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit', {camp});
    },

    // Update edited campground route
    updateCamp: async(req,res)=>{
        const {id} = req.params;
        const updatedCamp = await Campground.findByIdAndUpdate(id,{...req.body.campground},{new:true});
        const imgs = req.files.map(f=>({url: f.path, filename: f.filename}));
        updatedCamp.images.push(...imgs);
        await updatedCamp.save();
        const deletedImgs = req.body.deleteImages;
        if(deletedImgs && deletedImgs.length>0){
            for(let filename of deletedImgs){
                // TODO: Temp added if condition to avoid deleting the seeds imgs
                if(!img.filename.includes('/seeds/')) {
                    await cloudinary.uploader.destroy(filename);
                }
            }
            await updatedCamp.updateOne({ $pull: { images: { filename: { $in: deletedImgs } } } });
        }
        req.flash('success',`Successfully updated ${updatedCamp.title}!`);
        res.redirect(`/campgrounds/${updatedCamp._id}`);
    },

    // delete campground route
    deleteCamp: async(req,res)=>{
        const {id} = req.params;
        const camp = await Campground.findById(id);
        const images = camp.images;
        images.forEach((img) => {
            // TODO: Temp added if condition to avoid deleting the seeds imgs
            if(!img.filename.includes('/seeds/')) {
                cloudinary.uploader.destroy(img.filename);
            }
        });
        await Campground.findByIdAndDelete(id);
        req.flash('success',`Successfully deleted the campground!`);
        res.redirect(`/campgrounds`);
    }
}