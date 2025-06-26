const router = require('express').Router();
const User = require('../models/User.model');
const Recipe = require('../models/Recipe.model');
const protect = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// --- FINALIZED GENERATE ROUTE ---
router.post('/generate', protect, async (req, res) => {
    try {
        // Step 1: Get all data from request, including the new 'calories' filter
        const { ingredients, cuisine, diet, budget, calories } = req.body;
        const user = req.user; 

        if (!ingredients) {
            return res.status(400).json({ message: 'Ingredients are required.' });
        }

        // Step 2: Filter out any ingredients the user is allergic to or wants to avoid
        const allRestrictions = new Set([
            ...(user.allergies || []).map(a => a.toLowerCase()),
            ...(user.foodsToAvoid || []).map(f => f.toLowerCase())
        ]);
        
        const availableIngredients = ingredients
            .split(',').map(i => i.trim()).filter(i => !allRestrictions.has(i.toLowerCase())).join(', ');

        if (!availableIngredients) {
            return res.status(400).json({ message: 'All your ingredients are in your allergy/avoidance list.' });
        }

        // Step 3: Dynamically build a detailed prompt for the AI
        let prompt = `
You are an expert chef creating recipes for a user with specific needs. Adhere to all of the following constraints strictly.
Generate 10 unique recipe ideas based on the provided ingredients.
Your response must be a valid JSON array of objects. Each object must have these keys: "title", "ingredients" (as an array of strings), and "instructions".
Do not include any text or markdown formatting outside of the main JSON array.

**Primary Ingredients Available:**
- ${availableIngredients}

**Absolute Dietary Restrictions (Recipes MUST NOT contain these):**
- Allergies: ${user.allergies?.join(', ') || 'None'}
- Foods to Avoid: ${user.foodsToAvoid?.join(', ') || 'None'}
`;

        // Conditionally add the user's new filters to the prompt if they exist
        if (cuisine) {
            prompt += `
**Cuisine Style:**
- The user has requested the following cuisine style(s): "${cuisine}". Please adhere to this.
`;
        }
        if (diet) {
            prompt += `
**Specific Diet:**
- The recipe must adhere to the following diet(s): "${diet}".
`;
        }
        if (budget) {
            prompt += `
**Budget Constraint:**
- The user has a budget of $${budget} for any additional ingredients not listed in their primary ingredients. Do not suggest recipes that would require purchasing more than this amount in extra items. Prioritize using the primary ingredients first.
`;
        }
        // NEW: Added the new calorie constraint to the AI prompt
        if (calories) {
            prompt += `
**Calorie Constraint:**
- Each recipe generated MUST have approximately ${calories} calories per serving. This is a strict requirement.
`;
        }
    
        // Step 4: Call the AI with the new prompt and parse the response
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

// --- Other Recipe Routes (Unchanged) ---
router.post('/', protect, async (req, res) => {
    const { title, ingredients, instructions } = req.body;
    try {
        const recipe = new Recipe({ title, ingredients, instructions, userId: req.user._id });
        const createdRecipe = await recipe.save();
        res.status(201).json(createdRecipe);
    } catch (error) {
        res.status(500).json({ message: 'Error saving recipe', error: error.message });
    }
});

router.get('/', protect, async (req, res) => {
    try {
        const recipes = await Recipe.find({ userId: req.user._id });
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipes', error: error.message });
    }
});

module.exports = router;