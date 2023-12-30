if(process.env.NODE_ENV!='production'){
    require('dotenv').config();
}
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
mongoose.connect(dbURL);
const db = mongoose.connection;
db.on('error',console.error.bind(console, 'Connection error'));
db.once('open', ()=>{
    console.log('Database connected');
});

const sample = (array)=>array[Math.floor(Math.random()*array.length)];

const {sampleImgs} = require('./serveImgs');

const getRandomImg = (prev) =>{
    const index = Math.floor(Math.random()*sampleImgs.length);
    if(prev==index){
        return getRandomImg(prev);
    } else {
        return ({img:sampleImgs.at(index),index});
    }
}

const seedDB = async() =>{
    await Campground.deleteMany({});
    for(let i=0; i<300; i++){
        const rand1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*100)+10;
        const cityObj = cities[rand1000];
        const firstImg = getRandomImg();
        const secondImg = getRandomImg(firstImg.index);
        const camp = new Campground({
            author: '65904905bee7c811580d0835',
            // author: '658dd7d3130d4755e816d007',
            location: `${cityObj.city}, ${cityObj.state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                firstImg.img,
                secondImg.img
            ],
            geometry: {
                type: 'Point',
                coordinates: [cityObj.longitude,cityObj.latitude]
            },
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ea aliquid quidem cumque amet. Facilis autem, quos, facere quidem laudantium.',
            price
        })
        await camp.save();
    }
}
seedDB().then(() => {
    Campground.find({}).then(data => {
        console.log(data);
        db.close();
    });
});