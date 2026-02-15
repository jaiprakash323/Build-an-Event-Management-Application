const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      maxlength: [100, 'Event name cannot exceed 100 characters'],
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: {
      type: Date,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Technology', 'Music', 'Sports', 'Business', 'Art', 'Food', 'Health', 'Education', 'Entertainment', 'Other'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    imageUrl: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for checking if event is sold out
eventSchema.virtual('isSoldOut').get(function () {
  return this.availableSeats <= 0;
});

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function () {
  return this.date > new Date();
});

// Set availableSeats = capacity if not provided
eventSchema.pre('save', function (next) {
  if (this.isNew && this.availableSeats === undefined) {
    this.availableSeats = this.capacity;
  }
  next();
});

// Indexes for efficient searching
eventSchema.index({ name: 'text', description: 'text', organizer: 'text' });
eventSchema.index({ category: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ date: 1 });

module.exports = mongoose.model('Event', eventSchema);
