const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const protect = require('../middleware/authMiddleware');

// --- SIGNUP ---
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({ email, password: hashedPassword, username: email.split('@')[0] });
        await user.save();
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error during signup', error: error.message });
    }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
});

// --- GET & UPDATE PROFILE ---
router.get('/profile', protect, (req, res) => {
    res.json(req.user);
});

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
            user.allergies = req.body.allergies !== undefined ? req.body.allergies : user.allergies;
            user.foodsToAvoid = req.body.foodsToAvoid !== undefined ? req.body.foodsToAvoid : user.foodsToAvoid;

            if (req.body.newPassword && req.body.currentPassword) {
                const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
                if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });
                
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.newPassword, salt);
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

// --- NEW FEEDBACK ROUTE ---
// POST to add feedback (e.g., a disliked recipe)
router.post('/feedback', protect, async (req, res) => {
    const { dislikedRecipeTitle } = req.body;
    if (!dislikedRecipeTitle) {
        return res.status(400).json({ message: 'Recipe title is required.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Add the title to the disliked list if it's not already there
        if (!user.dislikedRecipes.includes(dislikedRecipeTitle)) {
            user.dislikedRecipes.push(dislikedRecipeTitle);
            await user.save();
        }

        res.status(200).json({ message: 'Feedback recorded.' });
    } catch (error) {
        console.error('Error recording feedback:', error);
        res.status(500).json({ message: 'Server error while recording feedback.' });
    }
});


module.exports = router;