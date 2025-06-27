const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    allergies: { type: [String], default: [] },
    foodsToAvoid: { type: [String], default: [] },
    dislikedRecipes: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);