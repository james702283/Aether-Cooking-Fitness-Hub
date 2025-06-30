import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Route imports
import userRoutes from './routes/user.routes.js';
import recipeRoutes from './routes/recipe.routes.js';
import logRoutes from './routes/log.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import workoutRoutes from './routes/workout.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch((err) => console.error('MongoDB Connection Error:', err));
    
// API Routes
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/workouts', workoutRoutes);

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Uploaded Files Statically
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Root endpoint
app.get('/', (req, res) => {
    res.send('Aether Hub API is running...');
});

// Server Initialization
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is live on port ${PORT}`));
