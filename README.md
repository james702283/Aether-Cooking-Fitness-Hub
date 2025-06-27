# Aether Cooking & Fitness Hub

## Overview

Welcome to Aether Cooking & Fitness, a revolutionary full-stack application designed to transform your culinary and wellness journey. This platform serves as your all-in-one personal assistant, leveraging the power of Artificial Intelligence to cater to your unique dietary needs, preferences, and lifestyle. Whether you're a seasoned chef or a novice in the kitchen, Aether Kitchen & Fitness provides the tools and inspiration you need to explore the world of food and fitness like never before.

Our mission is to empower users to take control of their nutrition and fitness with a seamless, intuitive, and highly personalized experience. From generating creative recipes with ingredients you already have to meticulously tracking your health and fitness progress, Aether Kitchen & Fitness is the ultimate tool for modern living.

---

## Technology Stack & Architecture

Aether Kitchen & Fitness is a full-stack application built with a modern, robust, and scalable technology stack. The architecture features a decoupled frontend and backend, communicating via a RESTful API.

### Backend (Server-Side)

* **Runtime Environment:** **Node.js**
* **Framework:** **Express.js** for building the RESTful API, routing, and middleware management.
* **Database:** **MongoDB** with **Mongoose** as the Object Data Modeling (ODM) library for all data persistence.
* **Authentication:** Secure user authentication is handled using **JSON Web Tokens (JWT)** for stateless sessions and **bcryptjs** for password hashing.
* **AI Integration:** Core intelligence is powered by the **Google Generative AI (Gemini) SDK** to provide dynamic recipe and workout suggestions.
* **Image Storage:** **Multer** processes multipart/form-data for file uploads, which are then hosted on the **Cloudinary** cloud platform.
* **Middleware:** Makes use of **CORS** for cross-origin resource sharing, custom authentication middleware for protecting routes, and **dotenv** for managing environment variables.

### Frontend (Client-Side)

* **Build Tool:** **Vite** is used as the lightning-fast build tool and development server.
* **Core Framework:** **React.js (v18+)** utilizing Hooks (`useState`, `useEffect`, `useCallback`) for state management and lifecycle features.
* **Styling:** A responsive and modern interface built with **Tailwind CSS**, a utility-first CSS framework.
* **API Communication:** **Axios** is used for all asynchronous REST API requests to the backend.
* **UI Components:** Crisp and consistent icons provided by the **Lucide React** library.
* **Data Export:** The application provides client-side data export to `.pdf` format using the **jsPDF** library.

---

## Key Features

### 🤖 AI-Powered Recipe Generation

* **Ingredient-Based Suggestions:** Simply enter the ingredients you have on hand, and our AI will generate a list of creative and delicious recipes you can make immediately.
* **Reduce Food Waste:** Make the most of what's in your pantry and refrigerator, minimizing waste and saving money.
* **Endless Inspiration:** Break free from culinary ruts with an endless stream of new and exciting recipe ideas tailored just for you.

### 🍔 Comprehensive Recipe Filtering

* **Dietary Preferences:** Filter recipes based on a vast selection of diets, including Vegan, Keto, Paleo, Gluten-Free, and more.
* **Cuisine Exploration:** Journey through global flavors by filtering by cuisines such as Italian, Mexican, Thai, and many others.
* **Nutritional Targets:** Set constraints for your nutritional goals by filtering recipes based on maximum calorie counts per portion.
* **Budget-Friendly Cooking:** Specify a budget for any additional ingredients required, ensuring your culinary creations align with your financial goals.

### 📚 Extensive Recipe Library

* **Personal Recipe Collection:** Save your favorite generated recipes to create a personalized digital cookbook.
* **Easy Access:** Quickly view and access your saved recipes anytime.
* **Seamless Management:** Effortlessly organize and delete recipes from your collection.

### 🏃‍♂️ Seamless Meal & Workout Logging

* **Daily Meal Log:** Easily log your breakfast, lunch, dinner, and snacks. Our AI-assisted input helps estimate caloric intake.
* **Detailed Workout Log:** Track physical activities with intelligent suggestions for relevant metrics (duration, distance, weight, etc.) and estimated calories burned.
* **Photo Journals:** Visually track your journey by uploading photos of your meals and fitness progress directly to your daily log.
* **Personal Notes:** Keep daily journals for both meals and workouts to reflect on progress and feelings.

### 📅 Intelligent Calendar & History

* **At-a-Glance History:** See a complete history of your logs in an interactive calendar, with daily summaries of calories consumed and burned.
* **Detailed Daily View:** Click on any day to see a comprehensive breakdown of all logged activities, notes, and photos.
* **Share Your Progress:** Easily share your daily logs with friends, family, or a nutritionist.

### 👤 Personalized User Accounts

* **Secure Authentication:** A secure sign-up and login system keeps your personal data safe.
* **Customizable Profile:** Personalize your experience by managing your username, email, and password.
* **Dietary Profile:** Inform the AI of your specific food allergies and items to avoid to further refine recipe generation.

---

## Getting Started

To get Aether Kitchen & Fitness running on your local machine for development and testing, follow these steps.

### Prerequisites

* **Node.js** (v18 or later recommended)
* **npm** (or yarn)
* **MongoDB:** A running instance of MongoDB or a connection string from a cloud provider like MongoDB Atlas.
* **API Keys:**
    * Cloudinary Account (for `API Key`, `API Secret`, and `Cloud Name`)
    * Google AI API Key

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Setup Backend:**
    * Navigate to the server directory:
        ```sh
        cd server
        ```
    * Install backend dependencies:
        ```sh
        npm install
        ```
    * Create a `.env` file in the `server` directory and add the following variables:
        ```env
        PORT=5001
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret_key
        GEMINI_API_KEY=your_google_ai_api_key

        CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
        CLOUDINARY_API_KEY=your_cloudinary_api_key
        CLOUDINARY_API_SECRET=your_cloudinary_api_secret
        ```
    * Replace the placeholder values with your actual credentials.

3.  **Setup Frontend:**
    * Navigate back to the root project directory:
        ```sh
        cd ..
        ```
    * Install frontend dependencies:
        ```sh
        npm install
        ```
    * The frontend is configured in `src/App.jsx` to connect to the backend at `http://localhost:5001`. Ensure this matches the `PORT` in your server's `.env` file.

4.  **Running the Application:**
    * **Start the Backend Server:** Open a terminal in the `server` directory and run:
        ```sh
        npm start
        ```
        The server should now be running on the port you specified (e.g., 5001).
    * **Start the Frontend Development Server:** Open a *second* terminal in the root project directory and run:
        ```sh
        npm run dev
        ```
        Vite will start the development server, and you can access the application at `http://localhost:5173` (or another port if 5173 is busy).

You should now have the full application running locally.
