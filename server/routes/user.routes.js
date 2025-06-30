import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/users/signup
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = new User({ email, password, username: email.split('@')[0] });
        await user.save();
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error during signup', error: error.message });
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/users/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
router.get('/profile', protect, (req, res) => {
    res.json(req.user);
});

// @desc    Update user profile (including new biometrics)
// @route   PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.username = req.body.username || user.username;
            if (req.body.email && req.body.email !== user.email) {
                 const existingUser = await User.findOne({ email: req.body.email });
                 if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                    return res.status(400).json({ message: 'Email already in use' });
                 }
                 user.email = req.body.email;
            }
            // Update biometrics
            user.age = req.body.age !== undefined ? req.body.age : user.age;
            user.height = req.body.height !== undefined ? req.body.height : user.height;
            user.weight = req.body.weight !== undefined ? req.body.weight : user.weight;

            // Update preferences
            user.allergies = req.body.allergies !== undefined ? req.body.allergies : user.allergies;
            user.foodsToAvoid = req.body.foodsToAvoid !== undefined ? req.body.foodsToAvoid : user.foodsToAvoid;

            // Update password if provided
            if (req.body.newPassword && req.body.currentPassword) {
                const isMatch = await user.matchPassword(req.body.currentPassword);
                if (!isMatch) return res.status(401).json({ message: 'Incorrect current password' });
                user.password = req.body.newPassword;
            }
            
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

// @desc    Save user feedback (disliked items)
// @route   POST /api/users/feedback
router.post('/feedback', protect, async (req, res) => {
    const { dislikedRecipeTitle, dislikedWorkoutTitle } = req.body;
    if (!dislikedRecipeTitle && !dislikedWorkoutTitle) {
        return res.status(400).json({ message: 'A disliked title is required.' });
    }
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (dislikedRecipeTitle && !user.dislikedRecipes.includes(dislikedRecipeTitle)) {
            user.dislikedRecipes.push(dislikedRecipeTitle);
        }
        if (dislikedWorkoutTitle && !user.dislikedWorkoutTitles.includes(dislikedWorkoutTitle)) {
            user.dislikedWorkoutTitles.push(dislikedWorkoutTitle);
        }
        await user.save();
        res.status(200).json({ message: 'Feedback recorded.' });
    } catch (error) {
        console.error('Error recording feedback:', error);
        res.status(500).json({ message: 'Server error while recording feedback.' });
    }
});

export default router;
