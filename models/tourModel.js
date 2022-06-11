const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require("./userModel");

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name!'],
        unique: true,
        trim: true,
        maxlength: [40, 'The tour name must have no more than 40 characters!'],
        minlength: [10, 'A tour name must have at list 10 characters!'],
        // validate: [validator.isAlpha, 'Name should contain only letters!']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a maxGroupSize!'],
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty!'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: "Available difficulties: 'easy', 'medium', 'difficult'!"
        } 
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        max: [5, 'Rating must be <= 5'],
        min: [1, 'Rating must be >= 1'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price!']
    },
    priceDiscount:{
        type: Number,
        validate:{
            validator: function(val){
                // will work when creating NEW doc only
                return val < this.price;
            }
        },
        message: 'Discount price must be less than price!'
    },
    summary: {
        type: String,
        trim: true,
        requierd: [true, 'A tour must have a summary!']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image!']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: "Point",
            enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type:{
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        },
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Users"
        }
        
    ]
}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});

tourSchema.virtual('durationWeeks')
    .get(function() {
        return this.duration / 7;
    });

tourSchema.virtual('reviews', {
    ref: "Review",
    foreignField: 'tour',
    localField: '_id'
})
// DOC MDW: will work only before .save() and .create()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true , replacement: '-'});
    next();
});

//EMBADING
// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);

//     next();
// });

// QUERY MDW
// tourSchema.pre('find', function(next){
tourSchema.pre(/^find/, function(next){
    this.find({ secretTour: { $ne: true }});

    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function(next){
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});


// tourSchema.post(/^find/, function(docs, next){
//     console.log(`Query took ${(Date.now() - this.start) / 1000} sec`);
//     next();
// });



const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;