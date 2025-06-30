import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    comment: { type: String, required: true }
}, { timestamps: true });

const workoutSchema = new Schema({
    title: { type: String, required: true },
    targetMuscles: { type: [String], required: true },
    instructions: { type: [String], required: true },
    equipmentNeeded: { type: [String], default: [] },
    difficulty: { type: String },
    workoutLength: { type: String },
    videoUrl: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: { 
        type: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, min: 1, max: 5 }
        }], 
        default: [] 
    },
    comments: { 
        type: [commentSchema], 
        default: [] 
    }
}, { timestamps: true });

const Workout = mongoose.model('Workout', workoutSchema);
export default Workout;
