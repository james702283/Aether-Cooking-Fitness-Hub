import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    age: { type: Number },
    height: {
        feet: { type: Number },
        inches: { type: Number },
    },
    weight: { type: Number },
    allergies: { type: [String], default: [] },
    foodsToAvoid: { type: [String], default: [] },
    dislikedRecipes: { type: [String], default: [] },
    dislikedWorkoutTitles: { type: [String], default: [] } 
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
