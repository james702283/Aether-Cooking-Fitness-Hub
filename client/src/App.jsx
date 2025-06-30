import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { BookOpen, ChefHat, LogOut, X, Share2, FileDown, AlertTriangle, CheckCircle, Save, Trash2, Printer, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, Calendar, Dumbbell, Utensils, BookHeart, Plus, ImagePlus, ThumbsUp, ThumbsDown, Star, Flame, Video } from 'lucide-react';

// --- EXPANDED: Suggestion Data for Filters ---
const CUISINE_SUGGESTIONS = ['Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Thai', 'French', 'Greek', 'Spanish', 'Korean', 'Vietnamese', 'Mediterranean', 'American', 'BBQ', 'Caribbean', 'German', 'Russian', 'Brazilian', 'Ethiopian', 'Moroccan'];
const DIET_SUGGESTIONS = ['Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'Low-Fat', 'Pescatarian', 'Whole30', 'Flexitarian', 'Low-FODMAP', 'Atkins'];
const INGREDIENT_SUGGESTIONS = ['Chicken Breast', 'Ground Beef', 'Pork Tenderloin', 'Salmon Fillet', 'Cod', 'Shrimp', 'Tofu', 'Tempeh', 'Eggs', 'Brown Rice', 'Quinoa', 'Whole Wheat Pasta', 'Potatoes', 'Sweet Potatoes', 'Lentils', 'Chickpeas', 'Black Beans', 'Bread', 'Flour', 'Sugar', 'Salt', 'Black Pepper', 'Olive Oil', 'Coconut Oil', 'Butter', 'Garlic', 'Onion', 'Ginger', 'Turmeric', 'Tomatoes', 'Cucumber', 'Lettuce', 'Spinach', 'Kale', 'Arugula', 'Broccoli', 'Cauliflower', 'Carrots', 'Bell Peppers', 'Mushrooms', 'Zucchini', 'Eggplant', 'Avocado', 'Lime', 'Lemon', 'Cilantro', 'Parsley', 'Basil', 'Oregano', 'Thyme', 'Rosemary', 'Cumin', 'Coriander', 'Paprika', 'Chili Powder', 'Cayenne Pepper', 'Soy Sauce', 'Tamari', 'Worcestershire Sauce', 'Balsamic Vinegar', 'Apple Cider Vinegar', 'Honey', 'Maple Syrup', 'Mustard', 'Mayonnaise', 'Ketchup', 'Greek Yogurt', 'Cheddar Cheese', 'Mozzarella', 'Parmesan', 'Feta', 'Goat Cheese', 'Milk', 'Almond Milk', 'Oat Milk', 'Heavy Cream', 'Nuts', 'Almonds', 'Walnuts', 'Pecans', 'Peanuts', 'Seeds', 'Chia Seeds', 'Flax Seeds', 'Hemp Seeds', 'Pumpkin Seeds', 'Dark Chocolate', 'Cocoa Powder', 'Vanilla Extract'];
const COMMON_FOODS = ['Apple', 'Banana', 'Orange', 'Strawberries', 'Blueberries', 'Chicken Breast', 'Salmon Fillet', 'Tuna Can', 'Ground Turkey', 'Brown Rice', 'White Rice', 'Oats', 'Rolled Oats', 'Almond Milk', 'Whole Milk', 'Greek Yogurt', 'Cottage Cheese', 'Protein Shake', 'Protein Bar', 'Green Salad', 'Caesar Salad', 'Turkey Sandwich', 'Cheese Pizza Slice', 'Beef Burger', 'Scrambled Eggs', 'Hard Boiled Egg', 'Avocado Toast'];
const COMMON_WORKOUTS = {
    'Running': ['duration', 'distance'],
    'Cycling': ['duration', 'distance'],
    'Walking': ['duration', 'distance'],
    'Swimming': ['duration', 'laps'],
    'Weightlifting': ['sets', 'reps', 'weight'],
    'Bench Press': ['sets', 'reps', 'weight'],
    'Barbell Squats': ['sets', 'reps', 'weight'],
    'Deadlifts': ['sets', 'reps', 'weight'],
    'Overhead Press': ['sets', 'reps', 'weight'],
    'Bicep Curls': ['sets', 'reps', 'weight'],
    'Tricep Pushdowns': ['sets', 'reps', 'weight'],
    'Lat Pulldowns': ['sets', 'reps', 'weight'],
    'Dumbbell Rows': ['sets', 'reps', 'weight'],
    'Push-ups': ['sets', 'reps'],
    'Pull-ups': ['sets', 'reps'],
    'Sit-ups': ['sets', 'reps'],
    'Plank': ['duration'],
    'Yoga': ['duration'],
    'HIIT Session': ['duration', 'rounds'],
    'Jumping Rope': ['duration'],
    'Kettlebell Swings': ['sets', 'reps', 'weight'],
    'Lunges': ['sets', 'reps', 'weight'],
};
const BODY_PART_SUGGESTIONS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs', 'Core', 'Glutes', 'Hamstrings', 'Quads', 'Calves', 'Forearms', 'Traps', 'Lats', 'Full Body', 'Upper Body', 'Lower Body', 'Cardio'];
const WORKOUT_EQUIPMENT_SUGGESTIONS = ['Dumbbells', 'Barbell', 'Kettlebell', 'Resistance Bands', 'Pull-up Bar', 'Bench', 'Treadmill', 'Stationary Bike', 'Elliptical', 'Rowing Machine', 'Cable Machine', 'Leg Press Machine', 'Squat Rack', 'Medicine Ball', 'Yoga Mat', 'Bodyweight', 'Free Weights'];
const WORKOUT_DIFFICULTY_OPTIONS = ['Any', 'Easy', 'Medium', 'Hard'];
const WORKOUT_LENGTH_OPTIONS = ['Any', '15 mins', '30 mins', '45 mins', '60 mins', '75 mins', '90 mins+'];


// --- API instance ---
const api = axios.create({
  baseURL: 'http://localhost:5001',
});

// --- Auth Helper ---
const authHeader = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

// --- Main App Component ---
export default function App() {
    const [token, setToken] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    const showModal = (content) => setModalContent(content);
    const hideModal = () => setModalContent(null);

    const handleSignOut = useCallback(() => {
        setToken(null);
        setUserEmail('');
        setUsername('');
        setUserId(null); 
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
    }, []);

    useEffect(() => {
        const existingToken = localStorage.getItem('token');
        if (existingToken) {
            setToken(existingToken);
            const fetchUserProfile = async () => {
                try {
                    const { data } = await api.get('/api/users/profile', authHeader(existingToken));
                    setUsername(data.username || '');
                    setUserEmail(data.email || '');
                    setUserId(data._id || null);
                    localStorage.setItem('userId', data._id);
                } catch (error) {
                    console.error("Session token is invalid. Logging out.");
                    handleSignOut();
                }
            };
            fetchUserProfile();
        }
        setIsAuthReady(true);
    }, [handleSignOut]);

    const handleSetToken = async (newToken, email) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        try {
            const { data } = await api.get('/api/users/profile', authHeader(newToken));
            setUsername(data.username || '');
            setUserEmail(data.email || '');
            setUserId(data._id || null);
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('userId', data._id);
        } catch (error) {
            console.error("Failed to fetch profile after login.");
            setUserEmail(email);
            setUsername('');
        }
    };
    
    const handleProfileUpdate = (updatedData) => {
        if (updatedData.username) setUsername(updatedData.username);
        if (updatedData.email) {
            setUserEmail(updatedData.email);
            localStorage.setItem('userEmail', updatedData.email);
        }
    };

    if (!isAuthReady) {
        return <SplashScreen />;
    }

    return (
        <div className="font-sans text-white bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop')" }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
                    .font-poppins { font-family: 'Poppins', sans-serif; }
                `}
            </style>
            <div className="min-h-screen w-full bg-black/50 flex flex-col">
                {!token ? (
                    <AuthScreen setToken={handleSetToken} />
                ) : (
                    <>
                        <Header userEmail={userEmail} username={username} handleSignOut={handleSignOut} />
                        <main className="flex-grow flex justify-center p-4 md:p-8">
                           <div className="w-full max-w-7xl">
                               <MainContent token={token} userId={userId} showModal={showModal} hideModal={hideModal} onProfileUpdate={handleProfileUpdate}/>
                           </div>
                        </main>
                    </>
                )}
            </div>
            {modalContent && <ModalWrapper onRequestClose={hideModal}>{modalContent}</ModalWrapper>}
        </div>
    );
}

// --- Main Content & Navigation ---
const MainContent = ({ token, userId, showModal, hideModal, onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState('generator');
    const tabProps = { token, userId, showModal, hideModal, onProfileUpdate };

    return (
        <div>
            <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="mt-4">
                {activeTab === 'generator' && <RecipeGeneratorTab {...tabProps} />}
                {activeTab === 'workout-finder' && <WorkoutFinderTab {...tabProps} />}
                {activeTab === 'favorites' && <SavedFavoritesTab {...tabProps} />}
                {activeTab === 'meal' && <MealLogTab {...tabProps} />}
                {activeTab === 'workout' && <WorkoutLogTab {...tabProps} />}
                {activeTab === 'calendar' && <CalendarTab {...tabProps} />}
                {activeTab === 'settings' && <AccountSettingsTab {...tabProps} />}
            </div>
        </div>
    );
};

// --- UPDATED: Navigation with Combined Favorites Tab ---
const TabNav = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'generator', label: 'AI Recipes', icon: ChefHat },
        { id: 'workout-finder', label: 'AI Workouts', icon: Flame },
        { id: 'meal', label: 'Meal Log', icon: Utensils },
        { id: 'workout', label: 'Workout Log', icon: Dumbbell },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'favorites', label: 'Favorites', icon: BookHeart },
        { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
    ];
    return (
        <nav className="flex flex-wrap justify-center items-center space-x-1 md:space-x-2 bg-gray-900/50 backdrop-blur-md p-2 rounded-xl border border-white/10">
            {tabs.map(tab => {
                 let themeClass = '';
                 if (activeTab === tab.id) {
                     if (tab.id.includes('workout') || tab.id.includes('finder') || tab.id === 'favorites') {
                         themeClass = 'bg-red-500/30 text-red-300';
                     } else {
                         themeClass = 'bg-green-500/30 text-green-300';
                     }
                 } else {
                    themeClass = 'text-gray-300 hover:bg-white/10';
                 }

                return (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)} 
                        className={`flex items-center space-x-2 px-2 md:px-3 py-2 rounded-lg transition-all duration-300 flex-grow justify-center text-xs md:text-sm ${themeClass}`}
                    >
                        <tab.icon className="w-5 h-5" />
                        <span className="hidden lg:inline">{tab.label}</span>
                    </button>
                )
            })}
        </nav>
    );
};

// --- Page-level Components ---

const Header = ({ userEmail, username, handleSignOut }) => (
    <header className="p-4 bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
                 <ChefHat className="w-8 h-8 text-green-400" />
                 <h1 className="text-xl md:text-2xl font-poppins font-semibold tracking-wide hidden md:block">Aether Cooking & Fitness Hub</h1>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-gray-400 hidden sm:inline">
                    {username ? `Hi, ${username}` : userEmail}
                </span>
                <button onClick={handleSignOut} className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    </header>
);

const IngredientTagInput = ({ selectedTags, onTagsChange, suggestionSource, themeColor = 'green' }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const wrapperRef = useRef(null);

    const colorClasses = {
        green: { bg: 'bg-green-500/80', border: 'focus-within:border-green-400', suggestionBg: 'bg-green-900/95', suggestionHover: 'hover:bg-green-700/80' },
        red: { bg: 'bg-red-500/80', border: 'focus-within:border-red-400', suggestionBg: 'bg-red-900/95', suggestionHover: 'hover:bg-red-700/80' }
    };
    const theme = colorClasses[themeColor] || colorClasses.green;


    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const addTag = (tag) => {
        const newTag = tag.trim();
        if (newTag && !selectedTags.map(t => t.toLowerCase()).includes(newTag.toLowerCase())) {
            onTagsChange([...selectedTags, newTag]);
        }
        setInputValue('');
        setSuggestions([]);
    };
    
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (value) {
            const filtered = suggestionSource.filter(s => 
                s.toLowerCase().startsWith(value.toLowerCase()) && 
                !selectedTags.map(t => t.toLowerCase()).includes(s.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        }
        if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
            removeTag(selectedTags[selectedTags.length - 1]);
        }
    };

    const removeTag = (tagToRemove) => {
        onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className={`w-full min-h-[8rem] bg-black/30 p-3 rounded-lg border border-transparent ${theme.border} flex flex-wrap gap-2 items-start content-start`}>
                {selectedTags.map((tag, index) => (
                    <div key={index} className={`${theme.bg} rounded-full px-3 py-1.5 flex items-center gap-2 text-sm font-medium`}>
                        <span>{tag}</span>
                        <button onClick={() => removeTag(tag)} className="text-white hover:bg-black/20 rounded-full p-0.5"><X size={16}/></button>
                    </div>
                ))}
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Add items..."
                    className="flex-grow bg-transparent p-1.5 focus:outline-none min-w-[120px]"
                />
            </div>
            {suggestions.length > 0 && (
                <div className={`absolute z-10 w-full mt-2 ${theme.suggestionBg} backdrop-blur-md border border-white/10 rounded-lg shadow-lg`}>
                    {suggestions.map((s, i) => (
                        <div key={i} onClick={() => addTag(s)} className={`p-3 ${theme.suggestionHover} cursor-pointer text-sm`}>
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const FilterTagInput = ({ title, placeholder, selectedTags, onTagsChange, suggestionSource, themeColor = 'green' }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const wrapperRef = useRef(null);

    const colorClasses = {
        green: {
            bg: 'bg-green-500/80',
            border: 'focus-within:border-green-400',
            suggestionBg: 'bg-green-900/95',
            suggestionHover: 'hover:bg-green-700/80'
        },
        red: {
            bg: 'bg-red-500/80',
            border: 'focus-within:border-red-400',
            suggestionBg: 'bg-red-900/95',
            suggestionHover: 'hover:bg-red-700/80'
        }
    };
    const theme = colorClasses[themeColor] || colorClasses.green;

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const addTag = (tag) => {
        const newTag = tag.trim();
        if (newTag && !selectedTags.map(t => t.toLowerCase()).includes(newTag.toLowerCase())) {
            onTagsChange([...selectedTags, newTag]);
        }
        setInputValue('');
        setSuggestions([]);
    };
    
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (value) {
            const filtered = suggestionSource.filter(s => 
                s.toLowerCase().startsWith(value.toLowerCase()) && 
                !selectedTags.map(t => t.toLowerCase()).includes(s.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        }
    };

    const removeTag = (tagToRemove) => {
        onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-300 mb-1">{title}</label>
            <div className={`relative bg-black/30 p-2 rounded-lg border border-transparent ${theme.border}`}>
                <div className="flex flex-wrap gap-2 min-h-[24px]">
                    {selectedTags.map((tag, index) => (
                        <div key={index} className={`${theme.bg} rounded-full px-2.5 py-0.5 flex items-center gap-1.5 text-xs`}>
                            <span>{tag}</span>
                            <button onClick={() => removeTag(tag)} className="text-white hover:bg-black/20 rounded-full"><X size={14}/></button>
                        </div>
                    ))}
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="flex-grow bg-transparent p-0.5 focus:outline-none min-w-[100px]"
                    />
                </div>
                 {suggestions.length > 0 && (
                    <div className={`absolute z-10 w-full mt-2 ${theme.suggestionBg} backdrop-blur-md border border-white/10 rounded-lg shadow-lg`}>
                        {suggestions.map((s, i) => (
                            <div key={i} onClick={() => addTag(s)} className={`p-2 ${theme.suggestionHover} cursor-pointer text-sm`}>
                                {s}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CustomSelect = ({ label, value, onChange, options, themeColor = 'green' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const colorClasses = {
        green: {
            border: 'focus:border-green-400',
            text: 'text-green-300',
            bgHover: 'hover:bg-green-500/30'
        },
        red: {
            border: 'focus:border-red-400',
            text: 'text-red-300',
            bgHover: 'hover:bg-red-500/30'
        }
    };
    const theme = colorClasses[themeColor] || colorClasses.green;


    const handleOptionClick = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block mb-2 text-sm font-medium">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-black/30 p-3 rounded-lg border border-transparent ${theme.border} focus:outline-none flex justify-between items-center text-left`}
            >
                <span>{value}</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-black/80 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg">
                    {options.map(option => (
                        <div
                            key={option}
                            onClick={() => handleOptionClick(option)}
                            className={`p-3 cursor-pointer ${theme.bgHover} ${option === value ? `${theme.text} font-bold` : ''}`}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const StarRating = ({ rating, onRatingChange, disabled = false }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={disabled}
                    onClick={() => onRatingChange(star)}
                    onMouseEnter={() => !disabled && setHoverRating(star)}
                    onMouseLeave={() => !disabled && setHoverRating(0)}
                    className="p-1 disabled:cursor-not-allowed"
                >
                    <Star
                        size={30}
                        className={`transition-colors duration-200 ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-500'}`}
                        fill={star <= (hoverRating || rating) ? 'currentColor' : 'none'}
                    />
                </button>
            ))}
        </div>
    );
};

const CommentSection = ({ itemType, itemId, initialComments, token, userId, onCommentsUpdate }) => {
    const [comments, setComments] = useState(initialComments || []);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !itemId) return;

        setIsSubmitting(true);
        try {
            const { data } = await api.post(`/api/${itemType}/${itemId}/comment`, { commentText: newComment }, authHeader(token));
            const updatedItem = data;
            setComments(updatedItem.comments);
            if (onCommentsUpdate) onCommentsUpdate(updatedItem.comments);
            setNewComment("");
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const { data } = await api.delete(`/api/${itemType}/${itemId}/comment/${commentId}`, authHeader(token));
            const updatedItem = data;
            setComments(updatedItem.comments);
            if (onCommentsUpdate) onCommentsUpdate(updatedItem.comments);
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    const themeColor = itemType === 'workouts' ? 'red' : 'green';

    return (
        <div className="mt-6">
            <h4 className="text-xl font-semibold mb-3">Community Feedback</h4>
            <form onSubmit={handleCommentSubmit} className="mb-4">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a public comment..."
                    rows="3"
                    className={`w-full bg-black/30 p-3 rounded-lg border border-transparent focus:border-${themeColor}-400 focus:outline-none resize-none`}
                    disabled={isSubmitting}
                />
                <div className="flex justify-end mt-2">
                    <button type="submit" disabled={isSubmitting || !newComment.trim()} className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500`}>
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                {comments.length > 0 ? (
                    comments.slice().reverse().map((comment) => (
                        <div key={comment._id} className="bg-black/20 p-3 rounded-lg flex gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 bg-${themeColor}-800 rounded-full flex items-center justify-center font-bold`}>
                                {comment.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center">
                                    <span className={`font-bold text-${themeColor}-300`}>{comment.username}</span>
                                    {comment.user === userId && (
                                        <button onClick={() => handleDeleteComment(comment._id)} className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-500/20">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                                <p className="text-gray-200 mt-1">{comment.comment}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                )}
            </div>
        </div>
    );
};


const RecipeGeneratorTab = ({ token, showModal, hideModal, userId }) => {
    const [ingredients, setIngredients] = useState([]);
    const [generatedRecipes, setGeneratedRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [cuisines, setCuisines] = useState([]);
    const [diets, setDiets] = useState([]);
    const [budget, setBudget] = useState('');
    const [calories, setCalories] = useState('');
    
    const showNotification = (message, isError = false) => {
        if(isError) setError(message); else setNotification(message);
        setTimeout(() => { setError(''); setNotification(''); }, 3000);
    };
    
    const handleGenerate = async () => {
        const hasFilters = cuisines.length > 0 || diets.length > 0 || budget || calories;
        if (ingredients.length === 0 && !hasFilters) {
            setError('Please enter some ingredients or apply a filter.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedRecipes([]);
        try {
            const payload = {
                ingredients: ingredients.join(','),
                cuisine: cuisines.join(','),
                diet: diets.join(','),
                budget,
                calories,
            };
            const response = await api.post('/api/recipes/generate', payload, authHeader(token));
            setGeneratedRecipes(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Error generating recipes. The AI might be busy.";
            showNotification(errorMessage, true);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSelectRecipe = (recipe) => {
        showModal(
            <RecipeDetailView 
                recipe={recipe} 
                onClose={hideModal} 
                showNotification={showNotification} 
                token={token} 
                userId={userId}
                isGenerated={true} 
            />
        );
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            {notification && <Notification message={notification} />}
            {error && <Notification message={error} isError={true} />}
            <h2 className="text-3xl font-bold mb-4">AI Recipe Generator</h2>
            <p className="text-gray-300 mb-6">Enter ingredients you have, or just use filters to get creative ideas.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IngredientTagInput
                    selectedTags={ingredients}
                    onTagsChange={setIngredients}
                    suggestionSource={INGREDIENT_SUGGESTIONS}
                    themeColor="green"
                />
                <div className="flex flex-col gap-2">
                     <button 
                        onClick={handleGenerate} 
                        disabled={isLoading} 
                        className="bg-green-500 hover:bg-green-600 p-4 rounded-lg font-bold transition-colors disabled:bg-gray-500 w-full flex-grow flex justify-center items-center"
                    >
                         {isLoading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : 'Generate Recipes'}
                    </button>
                    <button 
                        onClick={() => setShowFilters(!showFilters)} 
                        className="flex items-center justify-center gap-2 bg-gray-500/30 hover:bg-gray-500/50 p-2 rounded-lg text-sm transition-colors"
                    >
                        <SlidersHorizontal size={16} />
                        <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
                    </button>
                </div>
            </div>

            {showFilters && (
                 <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FilterTagInput 
                            title="Cuisines"
                            placeholder="Add a cuisine..."
                            selectedTags={cuisines}
                            onTagsChange={setCuisines}
                            suggestionSource={CUISINE_SUGGESTIONS}
                            themeColor="green"
                        />
                        <FilterTagInput 
                            title="Diets"
                            placeholder="Add a diet..."
                            selectedTags={diets}
                            onTagsChange={setDiets}
                            suggestionSource={DIET_SUGGESTIONS}
                            themeColor="green"
                        />
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Budget for extra items ($)</label>
                            <input 
                                type="number"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                placeholder="e.g., 15"
                                className="w-full bg-black/30 p-2 rounded-lg border border-transparent focus:border-green-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Max Calories per Portion</label>
                            <input 
                                type="number"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                                placeholder="e.g., 500"
                                className="w-full bg-black/30 p-2 rounded-lg border border-transparent focus:border-green-400 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}
           
            {generatedRecipes.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-4">Recipe Ideas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {generatedRecipes.map((recipe, index) => (
                            <div key={index} onClick={() => handleSelectRecipe(recipe)} className="bg-black/20 p-4 rounded-xl cursor-pointer hover:bg-green-500/20 transition-all transform hover:scale-105">
                                <h4 className="font-bold text-lg text-green-300">{recipe.title || 'Untitled Recipe'}</h4>
                                <p className="text-sm text-gray-400 line-clamp-3 mt-1">{Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : ''}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const WorkoutFinderTab = ({ token, showModal, hideModal, userId }) => {
    const [targetBodyParts, setTargetBodyParts] = useState([]);
    const [generatedWorkouts, setGeneratedWorkouts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [equipment, setEquipment] = useState([]);
    const [difficulty, setDifficulty] = useState('Any');
    const [workoutLength, setWorkoutLength] = useState('Any');
    const [useFreeWeights, setUseFreeWeights] = useState(false);
    const [freeWeightAmount, setFreeWeightAmount] = useState('');

    const showNotification = (message, isError = false) => {
        if(isError) setError(message); else setNotification(message);
        setTimeout(() => { setError(''); setNotification(''); }, 3000);
    };
    
    const handleGenerate = async () => {
        const hasFilters = equipment.length > 0 || difficulty !== 'Any' || workoutLength !== 'Any' || useFreeWeights;
        if (targetBodyParts.length === 0 && !hasFilters) {
            setError('Please enter a target body part or apply a filter.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedWorkouts([]);
        try {
            const payload = {
                targetBodyParts: targetBodyParts.join(','),
                equipment: equipment.join(','),
                difficulty: difficulty === 'Any' ? '' : difficulty,
                workoutLength: workoutLength === 'Any' ? '' : workoutLength,
                useFreeWeights,
                freeWeightAmount,
            };
            const response = await api.post('/api/workouts/generate', payload, authHeader(token));
            setGeneratedWorkouts(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Error generating workouts. The AI might be busy.";
            showNotification(errorMessage, true);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSelectWorkout = (workout) => {
        showModal(
            <WorkoutDetailView 
                workout={workout} 
                onClose={hideModal} 
                showNotification={showNotification} 
                token={token} 
                userId={userId}
                isGenerated={true}
            />
        );
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            {notification && <Notification message={notification} isError={false} />}
            {error && <Notification message={error} isError={true} />}
            <h2 className="text-3xl font-bold mb-4">AI Workout Finder</h2>
            <p className="text-gray-300 mb-6">Enter body parts you want to train, or just use filters to find the perfect workout.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IngredientTagInput
                    selectedTags={targetBodyParts}
                    onTagsChange={setTargetBodyParts}
                    suggestionSource={BODY_PART_SUGGESTIONS}
                    themeColor="red"
                />
                <div className="flex flex-col gap-2">
                     <button 
                        onClick={handleGenerate} 
                        disabled={isLoading} 
                        className="bg-red-500 hover:bg-red-600 p-4 rounded-lg font-bold transition-colors disabled:bg-gray-500 w-full flex-grow flex justify-center items-center"
                    >
                         {isLoading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : 'Find Workouts'}
                    </button>
                    <button 
                        onClick={() => setShowFilters(!showFilters)} 
                        className="flex items-center justify-center gap-2 bg-gray-500/30 hover:bg-gray-500/50 p-2 rounded-lg text-sm transition-colors"
                    >
                        <SlidersHorizontal size={16} />
                        <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
                    </button>
                </div>
            </div>

            {showFilters && (
                 <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FilterTagInput 
                            title="Available Equipment"
                            placeholder="Add equipment..."
                            selectedTags={equipment}
                            onTagsChange={setEquipment}
                            suggestionSource={WORKOUT_EQUIPMENT_SUGGESTIONS}
                            themeColor="red"
                        />
                        <CustomSelect
                            label="Workout Length"
                            value={workoutLength}
                            onChange={setWorkoutLength}
                            options={WORKOUT_LENGTH_OPTIONS}
                            themeColor="red"
                        />
                         <CustomSelect
                            label="Difficulty"
                            value={difficulty}
                            onChange={setDifficulty}
                            options={WORKOUT_DIFFICULTY_OPTIONS}
                            themeColor="red"
                        />
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Using Free Weights?</label>
                            <div className="flex items-center gap-4">
                               <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="radio" name="freeWeights" checked={!useFreeWeights} onChange={() => setUseFreeWeights(false)} className="form-radio bg-black/30 border-gray-500 text-red-500 focus:ring-red-500" /> No
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                   <input type="radio" name="freeWeights" checked={useFreeWeights} onChange={() => setUseFreeWeights(true)} className="form-radio bg-black/30 border-gray-500 text-red-500 focus:ring-red-500"/> Yes
                                </label>
                            </div>
                            {useFreeWeights && (
                                <input
                                    type="text"
                                    value={freeWeightAmount}
                                    onChange={(e) => setFreeWeightAmount(e.target.value)}
                                    placeholder="e.g., 25 lbs or 10 kg"
                                    className="w-full mt-2 bg-black/30 p-2 rounded-lg border border-transparent focus:border-red-400 focus:outline-none"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
           
            {generatedWorkouts.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-2xl font-bold mb-4">Workout Ideas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {generatedWorkouts.map((workout, index) => (
                            <div key={index} onClick={() => handleSelectWorkout(workout)} className="bg-black/20 p-4 rounded-xl cursor-pointer hover:bg-red-500/20 transition-all transform hover:scale-105">
                                <h4 className="font-bold text-lg text-red-300">{workout.title || 'Untitled Workout'}</h4>
                                <p className="text-sm text-gray-400 line-clamp-3 mt-1">{Array.isArray(workout.targetMuscles) ? workout.targetMuscles.join(', ') : ''}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const SavedFavoritesTab = ({ token, userId, showModal, hideModal }) => {
    const [recipes, setRecipes] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState('');

    const showNotification = (message, isError = false) => {
        setNotification({message, isError});
        setTimeout(() => setNotification(''), 3000);
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [recipesRes, workoutsRes] = await Promise.all([
                api.get('/api/recipes', authHeader(token)),
                api.get('/api/workouts', authHeader(token))
            ]);
            setRecipes(recipesRes.data);
            setWorkouts(workoutsRes.data);
        } catch (error) {
            console.error("Error fetching favorites:", error);
            showNotification('Could not load your favorites.', true);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRecipeUpdate = useCallback((updatedRecipe) => {
        setRecipes(currentRecipes => 
            currentRecipes.map(r => r._id === updatedRecipe._id ? updatedRecipe : r)
        );
    }, []);

    const handleWorkoutUpdate = useCallback((updatedWorkout) => {
        setWorkouts(currentWorkouts =>
            currentWorkouts.map(w => w._id === updatedWorkout._id ? updatedWorkout : w)
        );
    }, []);

    const handleSelectRecipe = (recipe) => {
        showModal(
            <RecipeDetailView 
                recipe={recipe} 
                onClose={hideModal} 
                showNotification={showNotification} 
                token={token}
                userId={userId}
                isGenerated={false}
                onUpdate={handleRecipeUpdate}
                onSave={fetchData} 
            />
        );
    };

     const handleSelectWorkout = (workout) => {
        showModal(
            <WorkoutDetailView
                workout={workout}
                onClose={hideModal}
                showNotification={showNotification}
                token={token}
                userId={userId}
                isGenerated={false}
                onUpdate={handleWorkoutUpdate}
                onSave={fetchData}
            />
        );
    };
    
    // --- Pass fetchData to detail views when generating new items ---
    const handleSelectGeneratedRecipe = (recipe) => {
        showModal(
            <RecipeDetailView 
                recipe={recipe} 
                onClose={hideModal} 
                showNotification={showNotification} 
                token={token} 
                userId={userId}
                isGenerated={true}
                onSave={fetchData} 
            />
        );
    };
     const handleSelectGeneratedWorkout = (workout) => {
        showModal(
            <WorkoutDetailView
                workout={workout}
                onClose={hideModal}
                showNotification={showNotification}
                token={token}
                userId={userId}
                isGenerated={true}
                onSave={fetchData}
            />
        );
    };

    const handleDelete = async (itemType, itemId) => {
       if (!window.confirm(`Are you sure you want to delete this ${itemType.slice(0, -1)}?`)) return;
        try {
            await api.delete(`/api/${itemType}/${itemId}`, authHeader(token));
            showNotification(`${itemType.slice(0, -1)} deleted!`);
            fetchData(); // Refetch all data after deletion
        } catch (error) {
            showNotification(`Error: Could not delete ${itemType.slice(0, -1)}.`, true);
        }
    };
    
    const calculateAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) {
            return { average: 'N/A', count: 0 };
        }
        const total = ratings.reduce((acc, r) => acc + r.rating, 0);
        const average = total / ratings.length;
        return { average: average.toFixed(1), count: ratings.length };
    };

    if (isLoading) {
        return <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>;
    }

    return (
        <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-8">
            {notification.message && <Notification message={notification.message} isError={notification.isError} />}
            
            <HorizontalScrollSection title="Saved Recipes" items={recipes} onSelect={handleSelectRecipe} onDelete={(id) => handleDelete('recipes', id)} calculateRating={calculateAverageRating} themeColor="green" />
            <HorizontalScrollSection title="Saved Workouts" items={workouts} onSelect={handleSelectWorkout} onDelete={(id) => handleDelete('workouts', id)} calculateRating={calculateAverageRating} themeColor="red" />
        </div>
    );
};

const HorizontalScrollSection = ({ title, items, onSelect, onDelete, calculateRating, themeColor }) => {
    const scrollContainerRef = useRef(null);
    const theme = {
        green: { text: 'text-green-300', shadow: 'hover:shadow-green-500/10' },
        red: { text: 'text-red-300', shadow: 'hover:shadow-red-500/10' }
    }[themeColor];

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: direction * (scrollContainerRef.current.offsetWidth * 0.8),
                behavior: 'smooth'
            });
        }
    };

    const handleDeleteClick = (item, e) => {
        e.stopPropagation();
        onDelete(item._id);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">{title}</h2>
                <div className="flex gap-2">
                    <button onClick={() => scroll(-1)} className="p-2 rounded-full bg-black/20 hover:bg-white/10 transition-colors"><ChevronLeft/></button>
                    <button onClick={() => scroll(1)} className="p-2 rounded-full bg-black/20 hover:bg-white/10 transition-colors"><ChevronRight/></button>
                </div>
            </div>
            
            <div ref={scrollContainerRef} className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
                {items.length > 0 ? (
                    items.map(item => {
                        const { average, count } = calculateRating(item.ratings);
                        return (
                            <div key={item._id} onClick={() => onSelect(item)} className={`bg-black/20 p-4 rounded-xl flex flex-col justify-between transition-all ${theme.shadow} w-64 flex-shrink-0 cursor-pointer`}>
                                <div>
                                    <h3 className={`text-xl font-bold ${theme.text} mb-2 line-clamp-2`}>{item.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-3 mb-2">{Array.isArray(item.ingredients) ? item.ingredients.join(', ') : Array.isArray(item.targetMuscles) ? item.targetMuscles.join(', ') : ''}</p>
                                    <div className="text-sm flex items-center gap-2 text-yellow-400">
                                        <Star size={16} fill="currentColor"/>
                                        <span className="font-bold">{average}</span>
                                        <span className="text-gray-400">({count} {count === 1 ? 'vote' : 'votes'})</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2 justify-end">
                                    <button onClick={(e) => handleDeleteClick(item, e)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full"><Trash2 size={18}/></button>
                                    <button onClick={() => onSelect(item)} className="flex-grow bg-gray-500/80 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">View</button>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center text-gray-400 py-8 w-full">You haven't saved any {title.toLowerCase().replace('saved ','')} yet.</div>
                )}
            </div>
        </div>
    );
};


const RecipeDetailView = ({ recipe, onClose, showNotification, token, userId, isGenerated, onUpdate, onSave }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState(recipe);

    useEffect(() => {
        setCurrentRecipe(recipe);
    }, [recipe]);

    const formatInstructions = (instructions) => {
        if (instructions) {
            if (Array.isArray(instructions)) return instructions.join('\n');
            if (typeof instructions === 'string') return instructions.replace(/\\n/g, '\n');
        }
        return 'Instructions not available.';
    };
    
    const handleSave = async () => {
        if (!currentRecipe) return;
        setIsSaving(true);
        try {
            await api.post('/api/recipes', { ...currentRecipe, userId: undefined }, authHeader(token));
            showNotification('Recipe saved to Favorites!');
            if (onSave) onSave(); // This will re-fetch the favorites list
            onClose();
        } catch (error) {
            showNotification("Error: Could not save recipe.", true);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleFeedback = async (feedbackType) => {
        if (feedbackType === 'dislike') {
            try {
                await api.post('/api/users/feedback', { dislikedRecipeTitle: currentRecipe.title }, authHeader(token));
                showNotification('Thanks! We won\'t show you this again.');
                onClose();
            } catch (error) {
                showNotification('Could not save feedback.', true);
            }
        }
        if (feedbackType === 'like') {
            showNotification('Glad you liked it!');
        }
    };

    const handleRatingChange = async (newRating) => {
        if (!currentRecipe._id) return;
        try {
            const { data } = await api.post(`/api/recipes/${currentRecipe._id}/rate`, { rating: newRating }, authHeader(token));
            const updatedRecipe = { ...currentRecipe, ratings: data.ratings };
            setCurrentRecipe(updatedRecipe);
            if (onUpdate) onUpdate(updatedRecipe);
        } catch (error) {
            showNotification('Failed to submit rating.', true);
            console.error(error);
        }
    };

    const handleCommentsUpdate = (newComments) => {
        const updatedRecipe = { ...currentRecipe, comments: newComments };
        setCurrentRecipe(updatedRecipe);
        if (onUpdate) onUpdate(updatedRecipe);
    };

    const getShareableText = () => {
        return `Recipe: ${currentRecipe.title}\n\nIngredients:\n${(Array.isArray(currentRecipe.ingredients) ? currentRecipe.ingredients.join('\n') : 'N/A')}\n\nInstructions:\n${formatInstructions(currentRecipe.instructions)}`;
    };

    const handleShare = async () => {
        const text = getShareableText();
        if (navigator.share) {
            try {
                await navigator.share({ title: currentRecipe.title, text });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    navigator.clipboard.writeText(text);
                    showNotification('Recipe copied to clipboard!');
                }
            }
        } else {
            navigator.clipboard.writeText(text);
            showNotification('Recipe copied to clipboard!');
        }
    };
    
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>${currentRecipe.title}</title><style>body{font-family:sans-serif;line-height:1.6;}ul{padding-left:20px;}</style></head><body>`);
        printWindow.document.write(`<h2>${currentRecipe.title}</h2><h4>Ingredients</h4><ul>${Array.isArray(currentRecipe.ingredients) ? currentRecipe.ingredients.map(ing => `<li>${ing}</li>`).join('') : ''}</ul><h4>Instructions</h4><p>${formatInstructions(currentRecipe.instructions).replace(/\n/g, '<br>')}</p>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const userRatingObj = currentRecipe.ratings?.find(r => r.user === userId);
    const myRating = userRatingObj ? userRatingObj.rating : 0;

    return (
        <div className="bg-black/75 backdrop-blur-xl p-6 md:p-8 rounded-2xl relative max-h-[85vh] overflow-y-auto border border-white/10 w-full">
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2 rounded-full hover:bg-white/10"><X size={24}/></button>
            
            <h3 className="text-3xl font-bold mb-4 text-green-300 text-center">{currentRecipe.title || 'Untitled Recipe'}</h3>
            
            <div className="grid md:grid-cols-2 gap-x-8">
                <div>
                    <h4 className="text-xl font-semibold mb-2">Ingredients</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-200">
                        {Array.isArray(currentRecipe.ingredients) ? currentRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>) : <li>Ingredients not available.</li>}
                    </ul>
                </div>
                <div className="mt-4 md:mt-0">
                    <h4 className="text-xl font-semibold mb-2">Instructions</h4>
                    <div className="text-gray-200 whitespace-pre-line leading-relaxed">{formatInstructions(currentRecipe.instructions)}</div>
                </div>
            </div>
            
            {!isGenerated && (
                <div className="mt-6 pt-6 border-t border-white/10">
                     <h4 className="text-xl font-semibold mb-2">Rate this Recipe</h4>
                     <p className="text-sm text-gray-400 mb-3">Your rating is visible to the community.</p>
                     <StarRating rating={myRating} onRatingChange={handleRatingChange} />
                     <CommentSection 
                        itemType="recipes"
                        itemId={currentRecipe._id}
                        initialComments={currentRecipe.comments}
                        token={token}
                        userId={userId}
                        onCommentsUpdate={handleCommentsUpdate}
                     />
                </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                    {isGenerated && (
                        <>
                            <button onClick={() => handleFeedback('like')} className="p-2 text-green-400 bg-green-500/20 rounded-full hover:bg-green-500/40 transition-colors" title="I like this">
                                <ThumbsUp size={20}/>
                            </button>
                             <button onClick={() => handleFeedback('dislike')} className="p-2 text-red-400 bg-red-500/20 rounded-full hover:bg-red-500/40 transition-colors" title="I dislike this">
                                <ThumbsDown size={20}/>
                            </button>
                        </>
                    )}
                </div>
                
                <div className="flex flex-wrap gap-2 justify-end">
                    {isGenerated && <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500">{isSaving ? 'Saving...' : <><Save size={18}/> Save to Favorites</>}</button>}
                    <button onClick={handleShare} className="flex items-center gap-2 bg-gray-600/50 hover:bg-gray-600/80 text-white font-bold py-2 px-4 rounded-lg transition-colors"><Share2 size={18}/> Share</button>
                    <ExportMenu getText={getShareableText} getTitle={() => currentRecipe.title || 'Recipe'} />
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-600/50 hover:bg-gray-600/80 text-white font-bold py-2 px-4 rounded-lg transition-colors"><Printer size={18}/> Print</button>
                </div>
            </div>
        </div>
    );
};

const WorkoutDetailView = ({ workout, onClose, showNotification, token, userId, isGenerated, onUpdate, onSave }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [currentWorkout, setCurrentWorkout] = useState(workout);

    useEffect(() => {
        setCurrentWorkout(workout);
    }, [workout]);

    const formatInstructions = (instructions) => {
        if (instructions) {
            if (Array.isArray(instructions)) return instructions.map(inst => `- ${inst}`).join('\n');
            if (typeof instructions === 'string') return instructions.replace(/\\n/g, '\n');
        }
        return 'Instructions not available.';
    };
    
    const handleSave = async () => {
        if (!currentWorkout) return;
        setIsSaving(true);
        try {
            await api.post('/api/workouts', { ...currentWorkout, userId: undefined }, authHeader(token));
            showNotification('Workout saved to Favorites!');
            if(onSave) onSave(); // This will re-fetch the favorites list
            onClose();
        } catch (error) {
            showNotification("Error: Could not save workout.", true);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleFeedback = async (feedbackType) => {
        if (feedbackType === 'dislike') {
            try {
                await api.post('/api/users/feedback', { dislikedWorkoutTitle: currentWorkout.title }, authHeader(token));
                showNotification('Thanks! We won\'t show you this again.');
                onClose();
            } catch (error) {
                showNotification('Could not save feedback.', true);
            }
        }
        if (feedbackType === 'like') {
            showNotification('Glad you liked it!');
        }
    };

    const handleRatingChange = async (newRating) => {
        if (!currentWorkout._id) return;
        try {
            const { data } = await api.post(`/api/workouts/${currentWorkout._id}/rate`, { rating: newRating }, authHeader(token));
            const updatedWorkout = { ...currentWorkout, ratings: data.ratings };
            setCurrentWorkout(updatedWorkout);
            if (onUpdate) onUpdate(updatedWorkout);
            showNotification('Your rating has been submitted!');
        } catch (error) {
            showNotification('Failed to submit rating.', true);
            console.error(error);
        }
    };

    const handleCommentsUpdate = (newComments) => {
        const updatedWorkout = { ...currentWorkout, comments: newComments };
        setCurrentWorkout(updatedWorkout);
        if (onUpdate) onUpdate(updatedWorkout);
    };

    const getShareableText = () => {
        return `Workout: ${currentWorkout.title}\n\nEquipment:\n${(Array.isArray(currentWorkout.equipmentNeeded) ? currentWorkout.equipmentNeeded.join('\n') : 'N/A')}\n\nInstructions:\n${formatInstructions(currentWorkout.instructions)}`;
    };

    const handleShare = async () => {
        const text = getShareableText();
        if (navigator.share) {
            try {
                await navigator.share({ title: currentWorkout.title, text });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    navigator.clipboard.writeText(text);
                    showNotification('Workout copied to clipboard!');
                }
            }
        } else {
            navigator.clipboard.writeText(text);
            showNotification('Workout copied to clipboard!');
        }
    };
    
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>${currentWorkout.title}</title><style>body{font-family:sans-serif;line-height:1.6;}ul{padding-left:20px;}</style></head><body>`);
        printWindow.document.write(`<h2>${currentWorkout.title}</h2><h4>Equipment</h4><ul>${Array.isArray(currentWorkout.equipmentNeeded) ? currentWorkout.equipmentNeeded.map(eq => `<li>${eq}</li>`).join('') : ''}</ul><h4>Instructions</h4><p>${formatInstructions(currentWorkout.instructions).replace(/\n/g, '<br>')}</p>`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const userRatingObj = currentWorkout.ratings?.find(r => r.user === userId);
    const myRating = userRatingObj ? userRatingObj.rating : 0;

    return (
        <div className="bg-black/75 backdrop-blur-xl p-6 md:p-8 rounded-2xl relative max-h-[85vh] overflow-y-auto border border-white/10 w-full">
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2 rounded-full hover:bg-white/10"><X size={24}/></button>
            
            <h3 className="text-3xl font-bold mb-4 text-red-300 text-center">{currentWorkout.title || 'Untitled Workout'}</h3>
            
            <div className="grid md:grid-cols-2 gap-x-8">
                <div>
                    <h4 className="text-xl font-semibold mb-2">Equipment Needed</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-200">
                        {Array.isArray(currentWorkout.equipmentNeeded) && currentWorkout.equipmentNeeded.length > 0 ? currentWorkout.equipmentNeeded.map((eq, i) => <li key={i}>{eq}</li>) : <li>No specific equipment required.</li>}
                    </ul>
                </div>
                <div className="mt-4 md:mt-0">
                    <h4 className="text-xl font-semibold mb-2">Instructions</h4>
                    <div className="text-gray-200 whitespace-pre-line leading-relaxed">{formatInstructions(currentWorkout.instructions)}</div>
                     {currentWorkout.videoUrl && (
                        <a href={currentWorkout.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            <Video size={18}/> Watch Tutorial
                        </a>
                    )}
                </div>
            </div>
            
            {!isGenerated && (
                <div className="mt-6 pt-6 border-t border-white/10">
                     <h4 className="text-xl font-semibold mb-2">Rate this Workout</h4>
                     <p className="text-sm text-gray-400 mb-3">Your rating is visible to the community.</p>
                     <StarRating rating={myRating} onRatingChange={handleRatingChange} />
                     <CommentSection 
                        itemType="workouts"
                        itemId={currentWorkout._id}
                        initialComments={currentWorkout.comments}
                        token={token}
                        userId={userId}
                        onCommentsUpdate={handleCommentsUpdate}
                     />
                </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                    {isGenerated && (
                        <>
                            <button onClick={() => handleFeedback('like')} className="p-2 text-green-400 bg-green-500/20 rounded-full hover:bg-green-500/40 transition-colors" title="I like this">
                                <ThumbsUp size={20}/>
                            </button>
                             <button onClick={() => handleFeedback('dislike')} className="p-2 text-red-400 bg-red-500/20 rounded-full hover:bg-red-500/40 transition-colors" title="I dislike this">
                                <ThumbsDown size={20}/>
                            </button>
                        </>
                    )}
                </div>
                
                <div className="flex flex-wrap gap-2 justify-end">
                    {isGenerated && <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500">{isSaving ? 'Saving...' : <><Save size={18}/> Save to Favorites</>}</button>}
                    <button onClick={handleShare} className="flex items-center gap-2 bg-gray-600/50 hover:bg-gray-600/80 text-white font-bold py-2 px-4 rounded-lg transition-colors"><Share2 size={18}/> Share</button>
                    <ExportMenu getText={getShareableText} getTitle={() => currentWorkout.title || 'Workout'} />
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-600/50 hover:bg-gray-600/80 text-white font-bold py-2 px-4 rounded-lg transition-colors"><Printer size={18}/> Print</button>
                </div>
            </div>
        </div>
    );
};


const AccountSettingsTab = ({ token, onProfileUpdate }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [bmi, setBmi] = useState(null);
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        allergies: [],
        foodsToAvoid: [],
        age: '',
        height: { feet: '', inches: '' },
        weight: '',
    });
    
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        const { weight, height } = profileData;
        const totalInches = (parseInt(height.feet) * 12) + parseInt(height.inches);
        const weightInLbs = parseInt(weight);

        if (weightInLbs > 0 && totalInches > 0) {
            const calculatedBmi = ((weightInLbs / (totalInches * totalInches)) * 703).toFixed(1);
            setBmi(calculatedBmi);
        } else {
            setBmi(null);
        }
    }, [profileData.weight, profileData.height]);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/api/users/profile', authHeader(token));
            setProfileData({
                username: data.username || '',
                email: data.email || '',
                allergies: data.allergies || [],
                foodsToAvoid: data.foodsToAvoid || [],
                age: data.age || '',
                height: data.height || { feet: '', inches: '' },
                weight: data.weight || '',
            });
        } catch (err) {
            setError('Could not load profile data.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    const showNotification = (message, isError = false) => {
        if (isError) setError(message); else setNotification(message);
        setTimeout(() => { setError(''); setNotification(''); }, 3000);
    };

    const handleUpdateDietaryLists = async (field, newTags) => {
        setProfileData(prev => ({...prev, [field]: newTags}));
        const payload = { [field]: newTags };
        try {
            await api.put('/api/users/profile', payload, authHeader(token));
            showNotification('Dietary restriction updated!', false);
        } catch (err) {
            showNotification(err.response?.data?.message || 'Failed to save restrictions.', true);
            fetchProfile(); 
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'feet' || name === 'inches') {
            setProfileData(prev => ({ ...prev, height: { ...prev.height, [name]: value } }));
        } else {
            setProfileData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError('');
        const payload = { 
            username: profileData.username, 
            email: profileData.email,
            age: profileData.age,
            height: profileData.height,
            weight: profileData.weight
        };

        if (passwordData.newPassword) {
            if (!passwordData.currentPassword) {
                showNotification('Please enter your current password to set a new one.', true);
                setIsSaving(false);
                return;
            }
            payload.currentPassword = passwordData.currentPassword;
            payload.newPassword = passwordData.newPassword;
        }
        try {
            const { data } = await api.put('/api/users/profile', payload, authHeader(token));
            showNotification('Profile updated successfully!');
            onProfileUpdate({ username: data.username, email: data.email });
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (err) {
            showNotification(err.response?.data?.message || 'Failed to update profile.', true);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>;
    }

    return (
        <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            {notification && <Notification message={notification} />}
            {error && <Notification message={error} isError={true} />}
            <h2 className="text-3xl font-bold mb-6">Account Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                     <div className="space-y-6 bg-black/20 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">Biometrics for AI</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
                                <input name="age" type="number" placeholder="Years" value={profileData.age} onChange={handleInputChange} className="w-full bg-black/30 p-2 rounded-lg border border-transparent focus:border-green-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Weight (lbs)</label>
                                <input name="weight" type="number" placeholder="lbs" value={profileData.weight} onChange={handleInputChange} className="w-full bg-black/30 p-2 rounded-lg border border-transparent focus:border-green-400 focus:outline-none" />
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-300 mb-1">Height</label>
                             <div className="grid grid-cols-2 gap-4">
                                <input name="feet" type="number" placeholder="Feet" value={profileData.height.feet} onChange={handleInputChange} className="w-full bg-black/30 p-2 rounded-lg border border-transparent focus:border-green-400 focus:outline-none" />
                                <input name="inches" type="number" placeholder="Inches" value={profileData.height.inches} onChange={handleInputChange} className="w-full bg-black/30 p-2 rounded-lg border border-transparent focus:border-green-400 focus:outline-none" />
                             </div>
                        </div>
                        {bmi && (
                            <div>
                                 <label className="block text-sm font-medium text-gray-300 mb-1">Estimated BMI</label>
                                 <div className="w-full bg-green-500/20 text-green-200 font-bold p-3 rounded-lg text-center text-xl">
                                    {bmi}
                                 </div>
                            </div>
                        )}
                     </div>

                    <TagInputSection 
                        title="Food Allergies" 
                        tags={profileData.allergies} 
                        onTagsChange={(newTags) => handleUpdateDietaryLists('allergies', newTags)}
                        placeholder="Type and press Enter..." 
                    />
                    <TagInputSection 
                        title="Foods to Avoid" 
                        tags={profileData.foodsToAvoid} 
                        onTagsChange={(newTags) => handleUpdateDietaryLists('foodsToAvoid', newTags)}
                        placeholder="Type and press Enter..." 
                    />
                </div>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Profile Information</h3>
                        <div className="space-y-4">
                            <input name="username" type="text" placeholder="Display Name" value={profileData.username} onChange={handleInputChange} className="w-full bg-black/30 p-3 rounded-lg border border-transparent focus:border-green-400 focus:outline-none" />
                            <input name="email" type="email" placeholder="Email Address" value={profileData.email} onChange={handleInputChange} className="w-full bg-black/30 p-3 rounded-lg border border-transparent focus:border-green-400 focus:outline-none" />
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-semibold mb-2">Change Password</h3>
                        <div className="space-y-4">
                            <input name="currentPassword" type="password" placeholder="Current Password" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full bg-black/30 p-3 rounded-lg border border-transparent focus:border-green-400 focus:outline-none" />
                            <input name="newPassword" type="password" placeholder="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full bg-black/30 p-3 rounded-lg border border-transparent focus:border-green-400 focus:outline-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                <button onClick={handleSaveChanges} disabled={isSaving} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-500">
                    {isSaving ? 'Saving...' : <><Save size={18}/> Save Changes</>}
                </button>
            </div>
        </div>
    );
};

const MealLogTab = ({ token, showModal, hideModal }) => {
    const [log, setLog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ message: '', isError: false });

    const showNotification = (message, isError = false) => {
        setNotification({message, isError});
        setTimeout(() => setNotification({ message: '', isError: false }), 3000);
    };

    const formatDate = (d) => d.toISOString().split('T')[0];
    const today = new Date();

    const fetchTodaysLog = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/api/logs/${formatDate(today)}`, authHeader(token));
            setLog(data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setLog(null);
            } else {
                setError('Could not load today\'s log.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchTodaysLog();
    }, [fetchTodaysLog]);

    const handleLogUpdate = (updatedLog) => {
        setLog(updatedLog);
        hideModal(); 
    };
    
    const handleJournalUpdate = (updatedLog) => {
        setLog(updatedLog);
    };

    const openLogMealModal = () => {
        showModal(
            <LogMealForm
                token={token}
                date={today}
                onLogUpdate={handleLogUpdate}
                onClose={hideModal}
                showNotification={showNotification}
            />
        );
    };

    const handleDeleteMeal = async (mealId) => {
        if (!log?._id) return;
        try {
            const { data } = await api.delete(`/api/logs/meal/${log._id}/${mealId}`, authHeader(token));
            setLog(data);
        } catch (error) {
            console.error("Error deleting meal:", error);
            showNotification("Failed to delete meal entry.", true);
        }
    };
    
    const totalCalories = log?.meals?.reduce((sum, meal) => sum + meal.calories, 0) || 0;

    if (isLoading) {
        return <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>;
    }

    return (
        <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            {notification.message && <Notification message={notification.message} isError={notification.isError} />}
            {error && <Notification message={error} isError={true} />}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">Today's Meal Log</h2>
                <div className="text-right">
                    <p className="text-lg">Total Calories:</p>
                    <p className="text-3xl font-bold text-green-400">{totalCalories} cal</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <button onClick={openLogMealModal} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-2">
                        <Plus/> Log a New Meal
                    </button>
                    {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(mealType => (
                        <div key={mealType}>
                            <h3 className="text-xl font-semibold mb-2">{mealType}</h3>
                            <div className="bg-black/20 p-4 rounded-lg space-y-2 min-h-[50px]">
                                {log?.meals?.filter(m => m.mealType === mealType).length > 0 ? (
                                    log.meals.filter(m => m.mealType === mealType).map((item) => (
                                        <div key={item._id} className="flex justify-between items-center group">
                                            <span>{item.description}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-400">{item.calories} cal</span>
                                                <button onClick={() => handleDeleteMeal(item._id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={16}/>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm">No entries for {mealType}.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="space-y-6">
                    <DayJournalSection 
                        log={log} 
                        token={token} 
                        onLogUpdate={handleJournalUpdate} 
                        date={today}
                        notesType="mealNotes"
                        title="Meal Journal"
                        placeholder="Notes on today's meals, diet, etc..."
                    />
                    <ImageUploadSection 
                        log={log} 
                        token={token} 
                        onLogUpdate={handleJournalUpdate} 
                        date={today} 
                        type="meal"
                        title="Meal Photos"
                        showModal={showModal}
                        hideModal={hideModal}
                        showNotification={showNotification}
                    />
                </div>
            </div>
        </div>
    );
};

const WorkoutLogTab = ({ token, showModal, hideModal }) => {
    const [log, setLog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ message: '', isError: false });

    const showNotification = (message, isError = false) => {
        setNotification({message, isError});
        setTimeout(() => setNotification({ message: '', isError: false }), 3000);
    };

    const formatDate = (d) => d.toISOString().split('T')[0];
    const today = new Date();

    const fetchTodaysLog = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/api/logs/${formatDate(today)}`, authHeader(token));
            setLog(data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setLog(null);
            } else {
                setError('Could not load today\'s log.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchTodaysLog();
    }, [fetchTodaysLog]);

    const handleLogUpdate = (updatedLog) => {
        setLog(updatedLog);
        hideModal();
    };
    
    const handleJournalUpdate = (updatedLog) => {
        setLog(updatedLog);
    };

    const openLogWorkoutModal = () => {
        showModal(
            <LogWorkoutForm
                token={token}
                date={today}
                onLogUpdate={handleLogUpdate}
                onClose={hideModal}
                showNotification={showNotification}
            />
        );
    };
    
    const handleDeleteWorkout = async (workoutId) => {
        if (!log?._id) return;
        try {
            const { data } = await api.delete(`/api/logs/workout/${log._id}/${workoutId}`, authHeader(token));
            setLog(data);
        } catch (error) {
            console.error("Error deleting workout:", error);
            showNotification("Failed to delete workout entry.", true);
        }
    };
    
    const totalCaloriesBurned = log?.workouts?.reduce((sum, workout) => sum + workout.caloriesBurned, 0) || 0;

    if (isLoading) {
        return <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>;
    }

    return (
        <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            {notification.message && <Notification message={notification.message} isError={notification.isError} />}
            {error && <Notification message={error} isError={true} />}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">Today's Workout Log</h2>
                <div className="text-right">
                    <p className="text-lg">Calories Burned:</p>
                    <p className="text-3xl font-bold text-red-400">{totalCaloriesBurned} cal</p>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                     <button onClick={openLogWorkoutModal} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-2">
                        <Plus/> Log a New Workout
                    </button>
                    <div className="bg-black/20 p-4 rounded-lg space-y-2 min-h-[50px]">
                        {log?.workouts?.length > 0 ? (
                            log.workouts.map((item) => (
                                <div key={item._id} className="flex justify-between items-center group">
                                    <span>{item.description}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400">{item.caloriesBurned} cal</span>
                                        <button onClick={() => handleDeleteWorkout(item._id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">No workout entries yet.</p>
                        )}
                    </div>
                </div>
                <div className="space-y-6">
                    <DayJournalSection 
                        log={log} 
                        token={token} 
                        onLogUpdate={handleJournalUpdate} 
                        date={today}
                        notesType="workoutNotes"
                        title="Workout Journal"
                        placeholder="Notes on today's workout, progress, etc..."
                    />
                    <ImageUploadSection 
                        log={log} 
                        token={token} 
                        onLogUpdate={handleJournalUpdate} 
                        date={today} 
                        type="workout"
                        title="Fitness / Progress Photos"
                        showModal={showModal}
                        hideModal={hideModal}
                        showNotification={showNotification}
                    />
                </div>
            </div>
        </div>
    );
};

const CalendarTab = ({ token, showModal, hideModal }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [monthlyData, setMonthlyData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', isError: false });

    const showNotification = (message, isError = false) => {
        setNotification({ message, isError });
        setTimeout(() => setNotification({ message: '', isError: false }), 3000);
    };

    const fetchMonthlyData = useCallback(async () => {
        setIsLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        try {
            const { data } = await api.get(`/api/logs/month?year=${year}&month=${month}`, authHeader(token));
            setMonthlyData(data);
        } catch (error) {
            console.error("Could not fetch monthly log data:", error);
            setMonthlyData({});
        } finally {
            setIsLoading(false);
        }
    }, [currentDate, token]);

    useEffect(() => {
        fetchMonthlyData();
    }, [fetchMonthlyData]);

    const handleDayClick = (day) => {
        showModal(
            <DailyDetailView
                date={day}
                token={token}
                onClose={hideModal}
                onLogUpdate={fetchMonthlyData}
                showNotification={showNotification}
            />
        );
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            {notification.message && <Notification message={notification.message} isError={notification.isError} />}
            <h2 className="text-3xl font-bold mb-4">Calendar & History</h2>
            <p className="text-gray-300 mb-6">Select a day to review your complete log. At-a-glance totals are shown for each day.</p>
            <CalendarView 
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                onDayClick={handleDayClick}
                monthlyData={monthlyData}
                isLoading={isLoading}
            />
        </div>
    );
};

const CalendarView = ({ currentDate, setCurrentDate, onDayClick, monthlyData, isLoading }) => {
    
    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };
    
    const formatDateKey = (d) => {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const renderDays = () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDay = startOfMonth.getDay();
        const daysInMonth = endOfMonth.getDate();
        
        const days = [];
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-start-${i}`} className="border-r border-b border-white/10"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const dataKey = formatDateKey(dayDate);
            const dayData = monthlyData[dataKey];
            
            days.push(
                <div 
                    key={i} 
                    onClick={() => onDayClick(dayDate)}
                    className="h-14 md:h-20 p-1 border-r border-b border-white/10 flex flex-col justify-between cursor-pointer hover:bg-green-500/20 transition-colors relative"
                >
                    <span className="self-end font-bold text-xs">{i}</span>
                    {dayData && (
                        <div className="text-xs space-y-0.5">
                            <div className="flex items-center gap-1 text-green-400">
                                <Utensils size={12}/>
                                <span className="font-medium">{dayData.caloriesIn || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-red-400">
                                <Dumbbell size={12}/>
                                <span className="font-medium">{dayData.caloriesOut || 0}</span>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        const totalCells = startDay + daysInMonth;
        const remainingCells = (7 - (totalCells % 7)) % 7;
        for (let i = 0; i < remainingCells; i++) {
            days.push(<div key={`empty-end-${i}`} className="border-r border-b border-white/10"></div>);
        }

        return days;
    };

    return (
        <div className="border-t border-l border-white/10 mt-4">
            <div className="flex justify-between items-center p-4 bg-black/20">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-white/10"><ChevronLeft/></button>
                <h3 className="text-2xl font-bold text-center">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block ml-3"></div>}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-white/10"><ChevronRight/></button>
            </div>
            <div className="grid grid-cols-7 text-center font-bold text-gray-300 text-xs sm:text-base">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => 
                    <div key={day} className="py-2 border-r border-b border-white/10">
                        {day.charAt(0)}
                        <span className="hidden sm:inline">{day.substring(1)}</span>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-7">
                {renderDays()}
            </div>
        </div>
    );
};

const DailyDetailView = ({ date, token, onClose, onLogUpdate, showNotification }) => {
    const [log, setLog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [enlargedImage, setEnlargedImage] = useState(null);

    const formatDate = (d) => d.toISOString().split('T')[0];

    const fetchLog = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/api/logs/${formatDate(date)}`, authHeader(token));
            setLog(data);
        } catch (error) {
            console.error("Error fetching daily log:", error);
            setLog(null);
        } finally {
            setIsLoading(false);
        }
    }, [date, token]);
    
    useEffect(() => {
        fetchLog();
    }, [fetchLog]);

    const handleDeleteImage = async (imageId) => {
        if (!log?._id || !imageId) return;
        if (!window.confirm("Are you sure you want to delete this image?")) return;

        try {
            const { data } = await api.delete(`/api/logs/image/${log._id}/${imageId}`, authHeader(token));
            setLog(data);
            onLogUpdate();
            setEnlargedImage(null);
        } catch (error) {
            console.error("Error deleting image:", error);
            if(showNotification) showNotification("Failed to delete image.", true);
        }
    };
    
    const getShareableTextForDay = () => {
        if (!log) return "No log data for this day.";
        let text = `Health Log for ${date.toLocaleDateString()}\n\n`;

        if(log.meals?.length > 0) {
            text += "--- MEALS ---\n";
            log.meals.forEach(m => {
                text += `- ${m.description} (~${m.calories} cal)\n`;
            });
            text += "\n";
        }
        
        if(log.workouts?.length > 0) {
            text += "--- WORKOUTS ---\n";
            log.workouts.forEach(w => {
                text += `- ${w.description} (~${w.caloriesBurned} cal burned)\n`;
            });
            text += "\n";
        }
        
        if(log.mealNotes) text += `MEAL NOTES:\n${log.mealNotes}\n\n`;
        if(log.workoutNotes) text += `WORKOUT NOTES:\n${log.workoutNotes}\n\n`;

        return text;
    };
    
    const handleShare = async () => {
        const textToShare = getShareableTextForDay();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `My Health Log for ${date.toLocaleDateString()}`,
                    text: textToShare,
                });
            } catch (err) {
                 if (err.name !== 'AbortError') {
                    console.error("Share failed:", err);
                    navigator.clipboard.writeText(textToShare);
                    showNotification('Content copied to clipboard!');
                 }
            }
        } else {
            navigator.clipboard.writeText(textToShare);
            showNotification('Content copied to clipboard!');
        }
    };
    
    const handleDeleteMeal = async (mealId) => {
        if (!log?._id) return;
        try {
            const { data } = await api.delete(`/api/logs/meal/${log._id}/${mealId}`, authHeader(token));
            setLog(data); 
            onLogUpdate(); 
        } catch (error) {
            console.error("Error deleting meal:", error);
        }
    };

    const handleDeleteWorkout = async (workoutId) => {
        if (!log?._id) return;
        try {
            const { data } = await api.delete(`/api/logs/workout/${log._id}/${workoutId}`, authHeader(token));
            setLog(data);
            onLogUpdate(); 
        } catch (error) {
            console.error("Error deleting workout:", error);
        }
    };

    return (
        <>
        <div className="bg-black/75 backdrop-blur-xl p-6 md:p-8 rounded-2xl relative max-h-[85vh] overflow-y-auto border border-white/10 w-full">
            <div className="flex justify-between items-start">
                 <h3 className="text-3xl font-bold mb-4 text-green-300">Log for {date.toLocaleDateString()}</h3>
                 <div>
                    <button onClick={handleShare} className="p-2 rounded-full hover:bg-white/10 transition-colors mr-2"><Share2 size={22}/></button>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors"><X size={22}/></button>
                 </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>
            ) : log && Object.keys(log).length > 1 ? ( 
                <div className="space-y-6">
                    <LogSection title="Meals" icon={Utensils} data={log.meals} onDelete={handleDeleteMeal} />
                    <LogSection title="Workouts" icon={Dumbbell} data={log.workouts} onDelete={handleDeleteWorkout} />
                    
                    {log.images && log.images.length > 0 && (
                         <div>
                            <h4 className="text-xl font-semibold flex items-center gap-2 mb-2"><ImagePlus/> Daily Photos</h4>
                            <div className="bg-black/20 p-4 rounded-lg">
                               <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                    {log.images.map((image) => (
                                        <div key={image._id} onClick={() => setEnlargedImage(image)} className="cursor-pointer group relative overflow-hidden rounded-md">
                                            <img 
                                                src={image.url} 
                                                alt={`log`} 
                                                className="w-full h-20 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                                            />
                                             <div className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${image.type === 'meal' ? 'text-green-300' : 'text-red-300'}`}>
                                                {image.type === 'meal' ? <Utensils size={24}/> : <Dumbbell size={24}/>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <JournalSection log={log} />
                </div>
            ) : (
                 <p className="text-center text-gray-400 py-16">No log entries found for this day.</p>
            )}
        </div>
        
        {enlargedImage && (
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex justify-center items-center p-4"
                onClick={() => setEnlargedImage(null)}
            >
                 <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl flex justify-center">
                    <EnlargedImageView 
                        image={enlargedImage} 
                        onClose={() => setEnlargedImage(null)} 
                        onDelete={handleDeleteImage}
                    />
                </div>
            </div>
        )}
        </>
    );
};


// --- Reusable Sub-Components ---

const LogSection = ({ title, icon: Icon, data, onDelete }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-xl font-semibold flex items-center gap-2"><Icon/> {title}</h4>
        </div>
        <div className="bg-black/20 p-4 rounded-lg space-y-2">
            {data && data.length > 0 ? data.map((item) => (
                <div key={item._id} className="flex justify-between items-center group">
                    <span>{item.description}</span>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400">{item.calories || item.caloriesBurned} cal</span>
                        <button onClick={() => onDelete(item._id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16}/>
                        </button>
                    </div>
                </div>
            )) : <p className="text-gray-400 text-sm">No entries for {title}.</p>}
        </div>
    </div>
);

const DayJournalSection = ({ log, token, onLogUpdate, date, notesType, title, placeholder }) => {
    const [text, setText] = useState(log?.[notesType] || '');
    const [isSaving, setIsSaving] = useState(false);
    const debounceTimeout = useRef(null);

    useEffect(() => {
        setText(log?.[notesType] || '');
    }, [log, notesType]);

    const handleSave = useCallback(async (value) => {
        setIsSaving(true);
        try {
            const { data } = await api.put('/api/logs/journal', { date: date.toISOString().split('T')[0], [notesType]: value }, authHeader(token));
            onLogUpdate(data);
        } catch (error) {
            console.error("Error saving journal:", error);
        } finally {
            setIsSaving(false);
        }
    }, [date, notesType, token, onLogUpdate]);
    
    const handleTextChange = (e) => {
        const value = e.target.value;
        setText(value);
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        debounceTimeout.current = setTimeout(() => {
            handleSave(value);
        }, 1500);
    };

    const handleShareJournal = async () => {
        if (!text.trim()) {
            return;
        }

        const shareData = {
            title: `${title} - Aether Cooking & Fitness Hub`,
            text: text,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error("Share failed:", err);
                    navigator.clipboard.writeText(text);
                }
            }
        } else {
            navigator.clipboard.writeText(text);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xl font-semibold flex items-center gap-2"><BookHeart/> {title}</h4>
                <button onClick={handleShareJournal} className="text-gray-400 hover:text-white transition-colors"><Share2 size={16} /></button>
            </div>
            <textarea
                value={text}
                onChange={handleTextChange}
                placeholder={placeholder}
                className="w-full h-32 bg-black/30 p-3 rounded-lg border border-transparent focus:border-green-400 focus:outline-none resize-none"
            />
            {isSaving && <p className="text-sm text-gray-400 text-right mt-1">Saving...</p>}
        </div>
    );
};

const EnlargedImageView = ({ image, onClose, onDelete }) => {
    const handleShareImage = async () => {
        try {
            const response = await fetch(image.url);
            const blob = await response.blob();
            const file = new File([blob], 'photo.jpg', { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'My Meal/Workout Photo',
                    text: 'From my Aether Cooking & Fitness Hub log.',
                });
            } else {
                throw new Error("File sharing not supported.");
            }
        } catch (err) {
            console.error("Share failed:", err);
            navigator.clipboard.writeText(image.url);
        }
    };

    return (
        <div className="relative">
            <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 flex gap-2">
                <button 
                    onClick={() => onDelete(image._id)}
                    className="text-white bg-red-600/80 rounded-full p-2 hover:bg-red-500 transition-colors z-10"
                    title="Delete Image"
                >
                    <Trash2 size={22}/>
                </button>
                <button 
                    onClick={handleShareImage} 
                    className="text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors z-10"
                    title="Share Image"
                >
                    <Share2 size={22}/>
                </button>
                <button 
                    onClick={onClose} 
                    className="text-white bg-black/50 rounded-full p-2 hover:bg-black/80 transition-colors z-10"
                    title="Close"
                >
                    <X size={22}/>
                </button>
            </div>
            <img 
                src={image.url}
                alt="Enlarged view" 
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
            />
        </div>
    );
};


const ImageUploadSection = ({ title, log, token, onLogUpdate, date, type, showModal, hideModal, showNotification }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    
    const handleDeleteImage = async (imageId) => {
        if (!log?._id || !imageId) return;
        if (!window.confirm("Are you sure you want to delete this image?")) return;

        try {
            const { data: updatedLog } = await api.delete(`/api/logs/image/${log._id}/${imageId}`, authHeader(token));
            onLogUpdate(updatedLog);
            hideModal();
        } catch (error) {
            console.error("Image delete failed:", error);
            if (showNotification) showNotification("Failed to delete image.", true);
        }
    };

    const handleImageClick = (image) => {
        if (showModal && hideModal) {
            showModal(<EnlargedImageView image={image} onClose={hideModal} onDelete={handleDeleteImage} />);
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const uploadRes = await api.post('/api/upload', formData, authHeader(token));
            const { url } = uploadRes.data;
            const logUpdatePayload = {
                date: date.toISOString().split('T')[0],
                type,
                url
            };
            const { data: updatedLog } = await api.post('/api/logs/image', logUpdatePayload, authHeader(token));
            
            onLogUpdate(updatedLog);

        } catch (error) {
            console.error("Image upload failed:", error);
            if (showNotification) showNotification("Image upload failed.", true);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-xl font-semibold flex items-center gap-2"><ImagePlus/> {title}</h4>
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="text-blue-400 hover:text-blue-300 text-sm font-bold disabled:text-gray-500">
                    {isUploading ? 'UPLOADING...' : 'UPLOAD'}
                </button>
            </div>
            <div className="bg-black/20 p-4 rounded-lg min-h-[100px]">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {log?.images?.filter(img => img.type === type).map((image) => (
                        <div key={image._id} onClick={() => handleImageClick(image)} className="cursor-pointer group relative overflow-hidden rounded-md">
                            <img 
                                src={image.url} 
                                alt={`${type} log`} 
                                className="w-full h-24 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                            />
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white text-xs font-bold uppercase">View</span>
                            </div>
                        </div>
                    ))}
                </div>
                {(!log?.images || log.images.filter(img => img.type === type).length === 0) && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">No images uploaded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const JournalSection = ({ log }) => (
    <div className="space-y-4">
        <div>
            <h4 className="text-xl font-semibold flex items-center gap-2 mb-2"><BookHeart/> Meal Journal</h4>
            <div className="w-full min-h-[96px] bg-black/30 p-3 rounded-lg border border-transparent">
                <p className="text-gray-300 whitespace-pre-line">{log?.mealNotes || <span className="text-gray-400">No meal notes for this day.</span>}</p>
            </div>
        </div>
        <div>
            <h4 className="text-xl font-semibold flex items-center gap-2 mb-2"><BookHeart/> Workout Journal</h4>
            <div className="w-full min-h-[96px] bg-black/30 p-3 rounded-lg border border-transparent">
                 <p className="text-gray-300 whitespace-pre-line">{log?.workoutNotes || <span className="text-gray-400">No workout notes for this day.</span>}</p>
            </div>
        </div>
    </div>
);


const LogMealForm = ({ token, date, onLogUpdate, onClose, showNotification }) => {
    const [mealType, setMealType] = useState('Breakfast');
    const [mealData, setMealData] = useState({ name: '', quantity: '1', size: 'medium' });
    const [isSaving, setIsSaving] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMealData(prev => ({...prev, [name]: value }));

        if (name === 'name' && value) {
            setSuggestions(COMMON_FOODS.filter(f => f.toLowerCase().startsWith(value.toLowerCase())));
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setMealData(prev => ({...prev, name: suggestion}));
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mealData.name.trim()) {
            showNotification('Please enter a food or meal name.', true);
            return;
        }
        setIsSaving(true);
        try {
            const { data } = await api.post('/api/logs/meal', { date: date.toISOString().split('T')[0], mealType, mealData }, authHeader(token));
            onLogUpdate(data);
        } catch (err) {
            showNotification('Failed to log meal. Please try again.', true);
        } finally {
            setIsSaving(false);
        }
    };

    return (
         <div className="bg-black/75 backdrop-blur-xl p-8 rounded-2xl w-full max-w-lg text-left border border-white/10">
            <h3 className="text-2xl font-bold mb-4">Log New Meal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <CustomSelect
                    label="Meal Type"
                    value={mealType}
                    onChange={setMealType}
                    options={['Breakfast', 'Lunch', 'Dinner', 'Snack']}
                />
                 <div className="relative">
                    <label className="block mb-2 text-sm font-medium">Food / Meal</label>
                    <input 
                        type="text"
                        name="name"
                        value={mealData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Apple or Chicken Salad"
                        className="w-full bg-black/30 p-3 rounded-lg border border-transparent focus:border-green-400 focus:outline-none"
                    />
                    {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-green-900/95 backdrop-blur-md border border-white/10 rounded-lg shadow-lg">
                            {suggestions.map((s, i) => (
                                <div key={i} onClick={() => handleSuggestionClick(s)} className="p-3 hover:bg-green-700/80 cursor-pointer">
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium">Quantity</label>
                        <input type="number" name="quantity" value={mealData.quantity} onChange={handleInputChange} className="w-full bg-black/30 p-3 rounded-lg border border-transparent focus:border-green-400 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium">Size / Unit</label>
                        <input type="text" name="size" value={mealData.size} onChange={handleInputChange} placeholder="e.g., medium, cup, 100g" className="w-full bg-black/30 p-3 rounded-lg border border-transparent focus:border-green-400 focus:outline-none" />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                     <button type="button" onClick={onClose} className="bg-gray-500/80 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-500">
                        {isSaving ? 'Saving...' : 'Log Meal'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const LogWorkoutForm = ({ token, date, onLogUpdate, onClose, showNotification }) => {
    const [workoutType, setWorkoutType] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [details, setDetails] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setWorkoutType(value);
        setDetails({});
        if (value) {
            setSuggestions(Object.keys(COMMON_WORKOUTS).filter(w => w.toLowerCase().startsWith(value.toLowerCase())));
        } else {
            setSuggestions([]);
        }
    };
    
    const handleSuggestionClick = (suggestion) => {
        setWorkoutType(suggestion);
        setSuggestions([]);
        setDetails({}); 
    };

    const handleDetailChange = (e) => {
        setDetails(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!workoutType.trim()) {
            showNotification('Please enter a workout.', true);
            return;
        }

        const workoutData = {
            type: workoutType,
            ...details
        };
        
        Object.keys(workoutData).forEach(key => {
            if (!workoutData[key]) {
                delete workoutData[key];
            }
        });

        setIsSaving(true);
        try {
            const { data } = await api.post('/api/logs/workout', { date: date.toISOString().split('T')[0], workoutData }, authHeader(token));
            onLogUpdate(data);
        } catch (err) {
            showNotification('Failed to log workout. Please try again.', true);
        } finally {
            setIsSaving(false);
        }
    };

    const renderDetailFields = () => {
        const fields = COMMON_WORKOUTS[workoutType];
        if (!fields) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {fields.map(field => (
                    <div key={field}>
                        <label className="block mb-1 text-xs font-medium capitalize">{field}</label>
                        <input
                            type="number"
                            name={field}
                            value={details[field] || ''}
                            onChange={handleDetailChange}
                            placeholder={field === 'duration' ? 'min' : field === 'distance' ? 'mi' : field === 'weight' ? 'lbs' : ''}
                            className="w-full bg-black/30 p-2 rounded-lg border border-transparent focus:border-green-400 focus:outline-none"
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
         <div className="bg-black/75 backdrop-blur-xl p-8 rounded-2xl w-full max-w-lg text-left border border-white/10">
            <h3 className="text-2xl font-bold mb-4">Log New Workout</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="relative">
                    <label className="block mb-2 text-sm font-medium">Workout / Exercise</label>
                    <input type="text" value={workoutType} onChange={handleInputChange} placeholder="e.g., Running or Bench Press" className="w-full bg-black/30 p-3 rounded-lg border border-transparent focus:border-green-400 focus:outline-none"/>
                    {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-green-900/95 backdrop-blur-md border border-white/10 rounded-lg shadow-lg">
                            {suggestions.map((s, i) => (
                                <div key={i} onClick={() => handleSuggestionClick(s)} className="p-3 hover:bg-green-700/80 cursor-pointer">
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {renderDetailFields()}
                
                <div className="flex justify-end gap-4 pt-4">
                     <button type="button" onClick={onClose} className="bg-gray-500/80 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" disabled={isSaving} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-500">
                        {isSaving ? 'Saving...' : 'Log Workout'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const TagInputSection = ({ title, tags, onTagsChange, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (!tags.map(t=>t.toLowerCase()).includes(newTag.toLowerCase())) {
                onTagsChange([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove) => {
        onTagsChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <div className="bg-black/20 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2 mb-2 min-h-[40px]">
                    {tags.map((tag, index) => (
                        <div key={index} className="bg-green-500/80 rounded-full px-3 py-1 flex items-center gap-2 text-sm">
                            <span>{tag}</span>
                            <button onClick={() => removeTag(tag)} className="text-white hover:bg-black/20 rounded-full p-0.5"><X size={16}/></button>
                        </div>
                    ))}
                </div>
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={placeholder}
                    className="w-full bg-transparent p-2 rounded-lg focus:outline-none"
                />
            </div>
        </div>
    );
};

const AuthScreen = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const endpoint = isSignUp ? '/api/users/signup' : '/api/users/login';
        try {
            const response = await api.post(endpoint, { email, password });
            setToken(response.data.token, email);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "An unknown error occurred. Please try again.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex justify-center items-center p-4">
            <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-gray-900/50 backdrop-blur-xl border border-white/20">
                <h1 className="text-4xl font-bold text-center mb-2 font-poppins">Welcome to Aether!</h1>
                <p className="text-center text-gray-300 mb-8">{isSignUp ? 'Create a new account' : 'Sign in to continue'}</p>
                {error && <Notification message={error} isError={true} />}
                <form onSubmit={handleSubmit}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-black/30 p-3 rounded-lg mb-4 border border-transparent focus:border-green-400 focus:outline-none" required />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-black/30 p-3 rounded-lg mb-6 border border-transparent focus:border-green-400 focus:outline-none" required />
                    <button type="submit" disabled={isLoading} className="w-full bg-green-500 hover:bg-green-600 p-3 rounded-lg font-bold transition-colors disabled:bg-gray-500 flex justify-center items-center">
                        {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>
                <p className="text-center mt-6">
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-bold text-green-400 hover:underline">
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
};


const ModalWrapper = ({ children, onRequestClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onRequestClose}>
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl flex justify-center">
            {children}
        </div>
    </div>
);


const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
     <div className="bg-black/75 backdrop-blur-xl p-8 rounded-2xl w-full max-w-md text-center border border-white/10">
        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-red-400"/>
        </div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
            <button onClick={onCancel} className="bg-gray-500/80 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
            <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Confirm Delete</button>
        </div>
    </div>
);

const Notification = ({ message, isError = false }) => (
    <div className={`fixed top-24 right-8 text-white py-3 px-5 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-fade-in-out ${isError ? 'bg-red-500' : 'bg-green-500'}`}>
        <style>{`
            @keyframes fade-in-out {
                0% { opacity: 0; transform: translateY(-20px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }
            .animate-fade-in-out { animation: fade-in-out 3s ease-in-out forwards; }
        `}</style>
        {isError ? <AlertTriangle size={20}/> : <CheckCircle size={20} />}
        <span>{message}</span>
    </div>
);

const SplashScreen = () => (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-900 text-white">
        <ChefHat className="w-24 h-24 animate-pulse text-green-400" />
        <h1 className="text-3xl font-bold mt-4 font-poppins">Aether Cooking & Fitness Hub</h1>
        <p className="mt-2 text-gray-300">Initializing...</p>
    </div>
);

const ExportMenu = ({ getText, getTitle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExport = (format) => {
        const text = getText();
        const title = getTitle().replace(/ /g, '_');

        if (format === 'txt') {
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else if (format === 'pdf') {
            if (window.jspdf) {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const splitText = doc.splitTextToSize(text, 180);
                doc.text(splitText, 10, 10);
                doc.save(`${title}.pdf`);
            } else {
                 const script = document.createElement('script');
                 script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                 script.onload = () => {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    const splitText = doc.splitTextToSize(text, 180);
                    doc.text(splitText, 10, 10);
                    doc.save(`${title}.pdf`);
                 };
                 document.body.appendChild(script);
            }
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-gray-600/50 hover:bg-gray-600/80 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                <FileDown size={18}/> Export <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
            </button>
            {isOpen && (
                <div className="absolute bottom-full mb-2 w-full bg-gray-700/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden z-10">
                    <button onClick={() => handleExport('txt')} className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10">as .txt</button>
                    <button onClick={() => handleExport('pdf')} className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10">as .pdf</button>
                </div>
            )}
        </div>
    );
};
