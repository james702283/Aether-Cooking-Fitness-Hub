import express from 'express';
import Workout from '../models/Workout.model.js';
import User from '../models/User.model.js';
import protect from '../middleware/authMiddleware.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

router.post('/generate', protect, async (req, res) => {
    try {
        const { targetBodyParts, equipment, difficulty, workoutLength, useFreeWeights, freeWeightAmount } = req.body;
        const user = await User.findById(req.user.id);

        if (!targetBodyParts && !equipment && !difficulty && !workoutLength) {
            return res.status(400).json({ message: 'Please provide at least one search criteria.' });
        }

        let prompt = `
You are an expert fitness trainer creating workouts for a user. Your response MUST be a valid JSON array of 10 objects.
Each object must have these keys: "title" (string), "targetMuscles" (array of strings), "equipmentNeeded" (array of strings), "instructions" (array of strings), and "videoUrl" (a YouTube search URL string, or null).
Do not include any text or markdown formatting outside of the main JSON array.

**User's Biometrics for consideration:**
- Age: ${user.age || 'Not provided'}
- Height: ${user.height?.feet || 'N/A'}'${user.height?.inches || 'N/A'}"
- Weight: ${user.weight || 'N/A'} lbs

**User's Request:**
- Target Body Parts: ${targetBodyParts || 'Any'}
- Available Equipment: ${equipment || 'Bodyweight'}
- Desired Difficulty: ${difficulty || 'Any'}
- Desired Workout Length: ${workoutLength || 'Any'}
`;
        if (useFreeWeights && freeWeightAmount) {
            prompt += `- The user is using free weights of the following weight: ${freeWeightAmount}.\n`;
        }
        if (user.dislikedWorkoutTitles && user.dislikedWorkoutTitles.length > 0) {
            prompt += `
**Disliked Workouts (DO NOT GENERATE THESE OR SIMILAR TITLES):**
- ${user.dislikedWorkoutTitles.join('\n- ')}
`;
        }
        prompt += `For the "videoUrl", create a YouTube search link like "https://www.youtube.com/results?search_query=how+to+do+[exercise+name]".`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const workoutsJson = JSON.parse(cleanedText);
        res.status(200).json(workoutsJson);

    } catch (error) {
        console.error("AI Workout Generation Error:", error);
        res.status(500).json({ message: "Error generating workouts from AI." });
    }
});

router.post('/', protect, async (req, res) => {
    const { title, targetMuscles, instructions, equipmentNeeded, difficulty, workoutLength, videoUrl } = req.body;
    try {
        const workout = new Workout({ 
            userId: req.user.id,
            title, 
            targetMuscles, 
            instructions, 
            equipmentNeeded, 
            difficulty, 
            workoutLength,
            videoUrl
        });
        const createdWorkout = await workout.save();
        res.status(201).json(createdWorkout);
    } catch (error) {
        res.status(400).json({ message: 'Error saving workout' });
    }
});

router.get('/', protect, async (req, res) => {
    try {
        const workouts = await Workout.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching workouts' });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const workout = await Workout.findOne({ _id: req.params.id, userId: req.user.id });
        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }
        await workout.deleteOne();
        res.json({ message: 'Workout deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting workout' });
    }
});

router.post('/:id/rate', protect, async (req, res) => {
    const { rating } = req.body;
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    const existingRatingIndex = workout.ratings.findIndex(r => r.user.toString() === req.user.id);
    if (existingRatingIndex > -1) {
        workout.ratings[existingRatingIndex].rating = rating;
    } else {
        workout.ratings.push({ user: req.user.id, rating });
    }
    const updatedWorkout = await workout.save();
    res.status(200).json(updatedWorkout);
});

router.post('/:id/comment', protect, async (req, res) => {
    const { commentText } = req.body;
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    
    const newComment = {
        user: req.user.id,
        username: req.user.username,
        comment: commentText
    };
    workout.comments.unshift(newComment);
    const updatedWorkout = await workout.save();
    res.status(201).json(updatedWorkout);
});

router.delete('/:id/comment/:commentId', protect, async (req, res) => {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    const comment = workout.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    if (comment.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    comment.deleteOne();
    const updatedWorkout = await workout.save();
    res.status(200).json(updatedWorkout);
});

export default router;
