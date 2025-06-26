const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    title: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// This safe-export pattern is critical for preventing crashes.
module.exports = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);
