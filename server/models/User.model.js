const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    username: { type: String, trim: true, default: 'New User' },
    allergies: { type: [String], default: [] },
    foodsToAvoid: { type: [String], default: [] }
}, { timestamps: true });

// This safe-export pattern is critical for preventing crashes.
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
