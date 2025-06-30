import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const mealSchema = new Schema({
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
    description: { type: String, required: true },
    calories: { type: Number, required: true }
});

const workoutEntrySchema = new Schema({
    description: { type: String, required: true },
    caloriesBurned: { type: Number, required: true }
});

const imageSchema = new Schema({
    type: { type: String, enum: ['meal', 'workout'], required: true },
    url: { type: String, required: true }
});

const dailyLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    meals: [mealSchema],
    workouts: [workoutEntrySchema],
    mealNotes: { type: String, default: '' },
    workoutNotes: { type: String, default: '' },
    images: [imageSchema]
}, { timestamps: true });

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);
export default DailyLog;
