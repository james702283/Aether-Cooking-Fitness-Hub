// In a real application, you would use an AI service like Google's Gemini API.
// This is a MOCK helper to simulate that functionality.

const generateMockRecipes = (params) => {
    console.log("Generating MOCK recipes with params:", params);
    return Array.from({ length: 10 }, (_, i) => ({
        title: `AI ${params.ingredients.split(',')[0] || 'Creative'} Recipe #${i + 1}`,
        ingredients: [...params.ingredients.split(','), `AI Ingredient ${i+1}`],
        instructions: [
            "Step 1: Prep the AI ingredients.",
            "Step 2: Cook them according to the AI's secret method.",
            "Step 3: Serve and enjoy the future of food."
        ],
        calories: 450 + (i * 10),
    }));
};

const generateMockWorkouts = (params) => {
    console.log("Generating MOCK workouts with params:", params);
    return Array.from({ length: 10 }, (_, i) => ({
        title: `AI ${params.targetBodyParts.split(',')[0] || 'Full Body'} Workout #${i + 1}`,
        targetMuscles: params.targetBodyParts.split(','),
        equipmentNeeded: params.equipment.split(',').filter(e => e),
        difficulty: params.difficulty || 'Medium',
        workoutLength: params.workoutLength || '45 mins',
        instructions: [
            `Exercise ${i+1}A: 3 sets of 12 reps.`,
            `Exercise ${i+1}B: 4 sets of 10 reps.`,
            `Exercise ${i+1}C: 3 sets to failure.`,
            `Cooldown: 5 minutes of stretching.`
        ],
        videoUrl: i % 3 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : null
    }));
};

// --- UPDATED AI PROMPT BUILDERS ---

export const generateRecipesAI = async (params) => {
    const { ingredients, cuisine, diet, budget, calories, userPreferences } = params;
    // In a real implementation, you would build a detailed prompt for the AI
    console.log("Building prompt with user stats:", userPreferences);
    let prompt = `User Age: ${userPreferences.age}, Height: ${userPreferences.height?.feet}'${userPreferences.height?.inches}", Weight: ${userPreferences.weight} lbs. BMI: ${userPreferences.bmi}. Create recipes...`;
    
    // For now, we return mock data
    return generateMockRecipes(params);
};

export const generateWorkoutsAI = async (params) => {
    const { targetBodyParts, equipment, difficulty, workoutLength, useFreeWeights, freeWeightAmount, userPreferences } = params;
    // In a real implementation, you would build a detailed prompt for the AI
    console.log("Building prompt with user stats:", userPreferences);
    let prompt = `User Age: ${userPreferences.age}, Height: ${userPreferences.height?.feet}'${userPreferences.height?.inches}", Weight: ${userPreferences.weight} lbs. BMI: ${userPreferences.bmi}. Create workouts...`;
    
    // For now, we return mock data
    return generateMockWorkouts(params);
};


// Mock calorie estimation functions
export const getNutritionalInfo = async (mealData) => {
    const { name, quantity, size } = mealData;
    const description = `${quantity || '1'} ${size || ''} ${name}`.trim();
    const calories = 100 + (name.length * 10) + (parseInt(quantity) * 50);
    return { description, calories: Math.round(calories) };
};

export const getWorkoutInfo = async (workoutData) => {
    const { type, duration, distance, sets, reps, weight } = workoutData;
    let description = type;
    if (duration) description += ` for ${duration} min`;
    if (distance) description += ` for ${distance} mi`;
    if (sets) description += ` (${sets}x${reps})`;
    if (weight) description += ` at ${weight}lbs`;
    const caloriesBurned = 150 + (type.length * 5) + (parseInt(duration || sets || 0) * 8);
    return { description, caloriesBurned: Math.round(caloriesBurned) };
};
