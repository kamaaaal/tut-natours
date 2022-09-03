const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            trim: true,
            minlength: [10, 'name is less than 10 letters'],
            maxlength: [40, 'tour name is larger than 40 letters'],
        },
        ratingsAverage: {
            type: mongoose.SchemaTypes.String.cast(false),
            pathType: Number,
            required: true,
            min: [0, `average rating can't be smaller than 0`],
            max: [5, `average rating can't be larger than 5`],
        },
        price: {
            type: Number,
            default: 0,
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (discount) {
                    // creating custom valiadator
                    return discount < this.price; // here "this" keyword works only on save not on update event
                },
                message: 'discount is larger than actual price', //
            },
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: ['easy', 'medium', 'difficult'],
        },
        ratingsQuantity: {
            type: Number,
        },
        startDates: {
            type: [Date],
        },
        duration: {
            type: Number,
        },
        ratingsAverage: {
            type: Number,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        // this slug field will be defined by pre method
        slug: String,
    },
    {
        // define options for virtual properties
        toJSON: { virtuals: true },
        toObject: { virutls: true },
    }
);

// defining virtual properties to get durtaion of tours in week
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});
// mongoose middleware
// document middleware  triggers on before save event (save or create method)
tourSchema.pre('save', function (next) {
    // creating a slug and storing it in to the adding it to the document
    // every value defined to this will reach the document
    console.log(`count1 pre save hook`);
    this.slug = slugify(this.name, { lower: true }); //this should be defined in shema too
    next();
});
// the can be multiple pre save hooks but we have call next on every hook except the last one
tourSchema.pre('save', function (next) {
    console.log(`count no:2 pre save hook`);
    next();
});
// a post funtion will be called after
tourSchema.post('save', function (doc, next) {
    console.log(doc);
    console.log('count1 post save hook');
    next();
});

module.exports = mongoose.model('tours', tourSchema);
