const mongoose = require("mongoose");
const { campgroundSchema } = require("../validationSchemas");
const Review = require('./review');
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };
const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_150');
});

ImageSchema.virtual('indexThumb').get(function(){
    return this.url.replace('/upload','/upload/w_400');
});

ImageSchema.virtual('campThumb').get(function(){
    return this.url.replace('/upload','/upload/w_1000');
});

const CampgroundSchema = new Schema({
    title: {
        type: String,
    },
    price: {
        type: Number,
    },
    images: [ImageSchema],
    description: {
        type: String,
    },
    geometry:{
        type:{
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: {
        type: String,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('geoData').get(function(){
    return {
        properties: {
            popUpMark:`
                <h6 class="mt-2 mb-1 me-3 lh-1"><a href="/campgrounds/${this._id}">${this.title}</a></h6>
                <p class="mb-1 mt-1 text-muted">${this.location}</p>
                `
            ,
        },
        geometry: this.geometry
    };
});

CampgroundSchema.post('findOneAndDelete', async (camp)=>{
    if(camp){
        await Review.deleteMany({
            _id: {
                $in: camp.reviews
            }
        });
    }
});
module.exports = mongoose.model('Campground', CampgroundSchema);