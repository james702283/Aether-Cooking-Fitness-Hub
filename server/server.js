const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---

// Specific CORS configuration to allow requests from the Vite frontend
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// --- Database Connection ---
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => {
        console.log("MongoDB database connection established successfully.");
    })
    .catch(err => {
        console.error("DATABASE CONNECTION FAILED:", err);
        process.exit(1);
    });

// --- Pre-load Models ---
require('./models/User.model');
require('./models/Recipe.model');
require('./models/DailyLog.model');

// --- API Routes ---
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/recipes', require('./routes/recipe.routes'));
app.use('/api/logs', require('./routes/log.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});