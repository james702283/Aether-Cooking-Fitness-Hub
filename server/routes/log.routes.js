const router = require('express').Router();
const mongoose = require('mongoose');
const protect = require('../middleware/authMiddleware');
const DailyLog = require('../models/DailyLog.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

const getOrCreateLog = async (userId, date) => {
    let log = await DailyLog.findOne({ userId, date });
    if (!log) {
        log = new DailyLog({ userId, date });
    }
    return log;
};

// GET /api/logs/month?year=<year>&month=<month>
router.get('/month', protect, async (req, res) => {
    try {
        const { year, month } = req.query;
        const userId = req.user._id;

        if (!year || !month) {
            return res.status(400).json({ message: 'Year and month query parameters are required.' });
        }
        
        const monthString = (parseInt(month, 10) + 1).toString().padStart(2, '0');
        const dateRegex = new RegExp(`^${year}-${monthString}-`);

        const monthlyLogs = await DailyLog.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    date: { $regex: dateRegex }
                }
            },
            {
                $project: {
                    _id: 0, 
                    date: "$date",
                    caloriesIn: { $sum: "$meals.calories" },
                    caloriesOut: { $sum: "$workouts.caloriesBurned" }
                }
            }
        ]);
        
        const formattedData = {};
        monthlyLogs.forEach(day => {
            formattedData[day.date] = {
                caloriesIn: day.caloriesIn,
                caloriesOut: day.caloriesOut
            };
        });

        res.json(formattedData);

    } catch (error) {
        console.error('Error fetching monthly log data:', error);
        res.status(500).json({ message: 'Server error fetching monthly log data' });
    }
});


// GET LOG DATA FOR A SINGLE DAY
router.get('/:date', protect, async (req, res) => {
    try {
        const log = await DailyLog.findOne({ userId: req.user._id, date: req.params.date });
        if (!log) return res.status(200).json({}); 
        res.json(log);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching log data' });
    }
});

// --- START: UPGRADED MEAL LOG ENDPOINT ---
router.post('/meal', protect, async (req, res) => {
    // Now accepts structured mealData object
    const { date, mealType, mealData } = req.body;

    if (!date || !mealType || !mealData || !mealData.name) {
        return res.status(400).json({ message: 'Date, meal type, and meal data with a name are required.' });
    }

    try {
        const description = `${mealData.quantity || '1'} ${mealData.size || ''} ${mealData.name}`.trim();
        
        const prompt = `Estimate the calories for the following meal: "${description}". Respond with only a single number.`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const estimatedCalories = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;

        const log = await getOrCreateLog(req.user._id, date);
        log.meals.push({ mealType, description, calories: estimatedCalories });
        const savedLog = await log.save();
        res.status(201).json(savedLog);
    } catch (error) {
        console.error("Error logging meal:", error);
        res.status(500).json({ message: 'Error logging meal' });
    }
});
// --- END: UPGRADED MEAL LOG ENDPOINT ---

// Helper function to create a readable workout description from structured data
const createWorkoutDescription = (data) => {
    let description = data.type;
    const details = [];
    if (data.duration) details.push(`${data.duration} min`);
    if (data.distance) details.push(`${data.distance} mi`);
    if (data.sets) details.push(`${data.sets} sets`);
    if (data.reps) details.push(`${data.reps} reps`);
    if (data.weight) details.push(`${data.weight} lbs`);
    
    if (details.length > 0) {
        description += ` (${details.join(', ')})`;
    }
    return description;
};

// UPGRADED WORKOUT LOG ENDPOINT
router.post('/workout', protect, async (req, res) => {
    const { date, workoutData } = req.body;

    if (!date || !workoutData || !workoutData.type) {
        return res.status(400).json({ message: 'Date and workout data with a type are required.' });
    }

    try {
        const promptDetails = Object.entries(workoutData)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');

        const prompt = `Estimate the calories burned for the following workout activity. Respond with only a single number. Workout details: ${promptDetails}`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const estimatedCaloriesBurned = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;

        const description = createWorkoutDescription(workoutData);

        const log = await getOrCreateLog(req.user._id, date);
        log.workouts.push({ description, caloriesBurned: estimatedCaloriesBurned });
        const savedLog = await log.save();
        res.status(201).json(savedLog);
    } catch (error) {
        console.error("Error logging workout:", error);
        res.status(500).json({ message: 'Error logging workout' });
    }
});


// UPDATE JOURNAL
router.put('/journal', protect, async (req, res) => {
    const { date, mealNotes, workoutNotes } = req.body;
    try {
        const log = await getOrCreateLog(req.user._id, date);
        if(mealNotes !== undefined) log.mealNotes = mealNotes;
        if(workoutNotes !== undefined) log.workoutNotes = workoutNotes;
        const savedLog = await log.save();
        res.status(200).json(savedLog);
    } catch (error) {
        console.error("Error saving journal:", error);
        res.status(500).json({ message: 'Error saving journal entry' });
    }
});

// ADD AN IMAGE URL TO A LOG
router.post('/image', protect, async (req, res) => {
    const { date, type, url } = req.body;
    if (!date || !type || !url) {
        return res.status(400).json({ message: 'Date, type, and image URL are required.' });
    }
    try {
        const log = await getOrCreateLog(req.user._id, date);
        log.images.push({ type, url });
        const savedLog = await log.save();
        res.status(201).json(savedLog);
    } catch (error) {
        console.error("Error saving image:", error);
        res.status(500).json({ message: 'Error saving image to log.' });
    }
});

// --- NEW DELETE ENDPOINTS ---

// DELETE a specific meal entry from a log
router.delete('/meal/:logId/:mealId', protect, async (req, res) => {
    try {
        const { logId, mealId } = req.params;
        const log = await DailyLog.findOneAndUpdate(
            { _id: logId, userId: req.user._id },
            { $pull: { meals: { _id: mealId } } },
            { new: true } // Return the updated document
        );

        if (!log) {
            return res.status(404).json({ message: "Log or meal entry not found." });
        }
        res.status(200).json(log);
    } catch (error) {
        console.error("Error deleting meal entry:", error);
        res.status(500).json({ message: "Error deleting meal entry." });
    }
});

// DELETE a specific workout entry from a log
router.delete('/workout/:logId/:workoutId', protect, async (req, res) => {
    try {
        const { logId, workoutId } = req.params;
        const log = await DailyLog.findOneAndUpdate(
            { _id: logId, userId: req.user._id },
            { $pull: { workouts: { _id: workoutId } } },
            { new: true } // Return the updated document
        );

        if (!log) {
            return res.status(404).json({ message: "Log or workout entry not found." });
        }
        res.status(200).json(log);
    } catch (error) {
        console.error("Error deleting workout entry:", error);
        res.status(500).json({ message: "Error deleting workout entry." });
    }
});

module.exports = router;