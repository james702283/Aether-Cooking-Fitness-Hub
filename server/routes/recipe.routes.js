import express from 'express';
import Recipe from '../models/Recipe.model.js';
import User from '../models/User.model.js';
import protect from '../middleware/authMiddleware.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// GET all saved recipes for a user
router.get('/', protect, async (req, res) => {
    try {
        const recipes = await Recipe.find({ userId: req.user.id });
        res.json(recipes);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).json({ message: 'Error fetching recipes' });
    }
});

// POST to save a new recipe
router.post('/', protect, async (req, res) => {
    const { title, ingredients, instructions } = req.body;
    try {
        const recipe = new Recipe({ title, ingredients, instructions, userId: req.user.id });
        const createdRecipe = await recipe.save();
        res.status(201).json(createdRecipe);
    } catch (error) {
        console.error("Error saving recipe:", error);
        res.status(400).json({ message: 'Error saving recipe' });
    }
});

// POST to generate recipes from AI
router.post('/generate', protect, async (req, res) => {
    try {
        const { ingredients, cuisine, diet, budget, calories } = req.body;
        const user = req.user; 

        if (!ingredients && !cuisine && !diet && !budget && !calories) {
            return res.status(400).json({ message: 'Please provide ingredients or at least one filter.' });
        }

        const allRestrictions = new Set([
            ...(user.allergies || []).map(a => a.toLowerCase()),
            ...(user.foodsToAvoid || []).map(f => f.toLowerCase())
        ]);
        
        const availableIngredients = ingredients
            .split(',').map(i => i.trim()).filter(i => i && !allRestrictions.has(i.toLowerCase())).join(', ');

        let prompt = `
You are an expert chef creating recipes for a user with specific needs. Adhere to all of the following constraints strictly.
Generate 10 unique recipe ideas. Your response must be a valid JSON array of objects. Each object must have these keys: "title", "ingredients" (as an array of strings), and "instructions" (as an array of strings).
Do not include any text or markdown formatting outside of the main JSON array.

**User's Biometrics for consideration:**
- Age: ${user.age || 'Not provided'}
- Height: ${user.height?.feet || 'N/A'}'${user.height?.inches || 'N/A'}"
- Weight: ${user.weight || 'N/A'} lbs

**Absolute Dietary Restrictions (Recipes MUST NOT contain these):**
- Allergies: ${user.allergies?.join(', ') || 'None'}
- Foods to Avoid: ${user.foodsToAvoid?.join(', ') || 'None'}
`;
        if(availableIngredients) {
             prompt += `\n**Primary Ingredients Available:**\n- ${availableIngredients}`;
        }
        if (user.dislikedRecipes && user.dislikedRecipes.length > 0) {
            prompt += `
**Disliked Recipes (DO NOT GENERATE THESE OR SIMILAR TITLES):**
- ${user.dislikedRecipes.join('\n- ')}
`;
        }
        if (cuisine) prompt += `\n**Cuisine Style:**\n- The user has requested the following cuisine style(s): "${cuisine}". Please adhere to this.`;
        if (diet) prompt += `\n**Specific Diet:**\n- The recipe must adhere to the following diet(s): "${diet}".`;
        if (budget) prompt += `\n**Budget Constraint:**\n- The user has a budget of $${budget} for any additional ingredients. Prioritize using the primary ingredients if provided.`;
        if (calories) prompt += `\n**Calorie Constraint:**\n- Each recipe generated MUST have approximately ${calories} calories per serving. This is a strict requirement.`;
    
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const recipesJson = JSON.parse(cleanedText);
        res.status(200).json(recipesJson);

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ message: "Error generating recipes from AI." });
    }
});

// DELETE a specific recipe by its ID
router.delete('/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findOne({ _id: req.params.id, userId: req.user.id });

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        await recipe.deleteOne();
        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Server error while deleting recipe:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST a new rating for a recipe
router.post('/:id/rate', protect, async (req, res) => {
    try {
        const { rating } = req.body;
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

        const existingRatingIndex = recipe.ratings.findIndex(r => r.user.toString() === req.user.id);

        if (existingRatingIndex > -1) {
            recipe.ratings[existingRatingIndex].rating = rating;
        } else {
            recipe.ratings.push({ user: req.user.id, rating });
        }

        await recipe.save();
        res.status(200).json(recipe);
    } catch (error) {
        res.status(500).json({ message: 'Server error while rating recipe' });
    }
});

// POST a new comment on a recipe
router.post('/:id/comment', protect, async (req, res) => {
    try {
        const { commentText } = req.body;
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        
        const newComment = {
            user: req.user.id,
            username: req.user.username,
            comment: commentText
        };

        recipe.comments.unshift(newComment);
        await recipe.save();
        res.status(201).json(recipe);
    } catch (error) {
        res.status(500).json({ message: 'Server error while adding comment' });
    }
});

// DELETE a comment from a recipe
router.delete('/:id/comment/:commentId', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

        const comment = recipe.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this comment' });
        }

        await comment.deleteOne();
        res.status(200).json(recipe);
    } catch (error) {
        res.status(500).json({ message: 'Server error while deleting comment' });
    }
});

export default router;
