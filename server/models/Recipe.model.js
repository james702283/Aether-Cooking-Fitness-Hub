const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- NEW: Nested Schema for individual comments ---
// This creates a blueprint for what each comment will look like.
const commentSchema = new Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    username: { 
        type: String, 
        required: true 
    },
    comment: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });


// --- Main Recipe Schema (Updated) ---
const recipeSchema = new Schema({
    title: { type: String, required: true },
    ingredients: { type: [String], required: true },
    instructions: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    // --- ADDED THIS SECTION ---
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
    // --- END OF ADDED SECTION ---

}, { timestamps: true });

// This safe-export pattern is critical for preventing crashes.
module.exports = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema);