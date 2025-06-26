const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-schema for individual meals
const mealSchema = new Schema({
    mealType: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    calories: {
        type: Number,
        required: true
    }
});

// Sub-schema for individual workouts
const workoutSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    caloriesBurned: {
        type: Number,
        required: true
    }
});

// Sub-schema for image entries
const imageSchema = new Schema({
    type: {
        type: String,
        enum: ['meal', 'workout'],
        required: true
    },
    url: {
        type: String,
        required: true
    }
});

// Main schema for an entire day's log
const dailyLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // Storing date as YYYY-MM-DD string for easy lookup
        required: true
    },
    meals: [mealSchema],
    workouts: [workoutSchema],
    mealNotes: { type: String, default: '' },
    workoutNotes: { type: String, default: '' },
    images: [imageSchema]
}, {
    timestamps: true,
});

// Create a compound index to ensure one log per user per day
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

// Use the safe-export pattern to prevent OverwriteModelError
module.exports = mongoose.models.DailyLog || mongoose.model('DailyLog', dailyLogSchema);
