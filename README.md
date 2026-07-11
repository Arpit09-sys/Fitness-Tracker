# FitTrack - Personal Fitness Tracker 🏋️‍♂️

A full-stack web application for tracking fitness progress, workouts, and health metrics. Built with Node.js, Express, MongoDB, and vanilla JavaScript.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)

---

## 📋 Features

- **User Authentication** — Secure signup/login with JWT tokens and bcrypt password hashing
- **Dashboard** — View BMI, BMR, daily calorie needs, water intake goals, and recent progress at a glance
- **BMI Calculator** — Automatically calculates BMI with category (Underweight/Normal/Overweight/Obese)
- **BMR & Calorie Calculator** — Uses the Mifflin-St Jeor equation with activity level multipliers
- **Water Intake Tracker** — Daily water goal based on body weight (weight × 35ml)
- **Workout Logging** — Log workouts with name, duration, and notes
- **Progress Tracking** — Track daily weight, water intake, and workout completion with full CRUD (add/edit/delete)
- **Progress Photos** — Upload front and side photos to visually track body transformation
- **Profile Management** — Update personal info (age, gender, height, weight, activity level, fitness goal)

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| **Backend**  | Node.js, Express.js                |
| **Database** | MongoDB Atlas (Mongoose ODM)       |
| **Auth**     | JWT (JSON Web Tokens), bcrypt      |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript    |
| **File Upload** | Multer                          |
| **Security** | Helmet, CORS                       |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arpit09-sys/Fitness-Tracker.git
   cd Fitness-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory (see `.env.example`):
   ```
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000) in your browser.

### First Time Usage

- Go to **Register** page and create a new account
- Fill in your details (name, email, password, age, gender, height, weight, activity level, goal)
- After registration you'll be automatically logged in and redirected to the Dashboard

---

## 📁 Project Structure

```
Fitness-Tracker/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Signup & Login logic
│   ├── dashboardController.js # BMI, BMR, calorie & water calculations
│   ├── photoController.js     # Photo upload & retrieval
│   ├── profileController.js   # Get & update user profile
│   ├── progressController.js  # CRUD for daily progress entries
│   └── workoutController.js   # Add & get workouts
├── middleware/
│   ├── auth.js                # JWT authentication middleware
│   └── upload.js              # Multer file upload configuration
├── models/
│   ├── Photo.js               # Photo schema
│   ├── Progress.js            # Progress schema
│   ├── User.js                # User schema
│   └── Workout.js             # Workout schema
├── public/
│   ├── css/
│   │   └── style.css          # Application styles
│   ├── js/
│   │   ├── auth.js            # Login & register handlers
│   │   ├── dashboard.js       # Dashboard data rendering
│   │   ├── photos.js          # Photo upload & gallery
│   │   ├── profile.js         # Profile form handling
│   │   ├── progress.js        # Progress CRUD handlers
│   │   └── workout.js         # Workout form & history
│   ├── dashboard.html         # Dashboard page
│   ├── index.html             # Login page
│   ├── photos.html            # Progress photos page
│   ├── profile.html           # User profile page
│   ├── progress.html          # Progress tracker page
│   ├── register.html          # Registration page
│   └── workout.html           # Workout log page
├── routes/
│   ├── authRoutes.js          # POST /api/auth/signup, /api/auth/login
│   ├── dashboardRoutes.js     # GET /api/dashboard
│   ├── photoRoutes.js         # GET & POST /api/photos
│   ├── profileRoutes.js       # GET & PUT /api/profile
│   ├── progressRoutes.js      # GET, POST, PUT, DELETE /api/progress
│   └── workoutRoutes.js       # GET & POST /api/workout
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── package.json               # Project metadata & dependencies
├── server.js                  # Express server entry point
└── README.md                  # This file
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint           | Description       | Auth |
|--------|--------------------|--------------------|------|
| POST   | `/api/auth/signup` | Register new user  | No   |
| POST   | `/api/auth/login`  | Login user         | No   |

### Dashboard
| Method | Endpoint         | Description                    | Auth |
|--------|------------------|--------------------------------|------|
| GET    | `/api/dashboard`  | Get BMI, BMR, calories, water | Yes  |

### Profile
| Method | Endpoint        | Description        | Auth |
|--------|-----------------|--------------------|------|
| GET    | `/api/profile`  | Get user profile   | Yes  |
| PUT    | `/api/profile`  | Update profile     | Yes  |

### Workouts
| Method | Endpoint        | Description         | Auth |
|--------|-----------------|---------------------|------|
| POST   | `/api/workout`  | Add a workout       | Yes  |
| GET    | `/api/workout`  | Get all workouts    | Yes  |

### Progress
| Method | Endpoint            | Description             | Auth |
|--------|---------------------|-------------------------|------|
| POST   | `/api/progress`     | Add progress entry      | Yes  |
| GET    | `/api/progress`     | Get all progress entries| Yes  |
| PUT    | `/api/progress/:id` | Update progress entry   | Yes  |
| DELETE | `/api/progress/:id` | Delete progress entry   | Yes  |

### Photos
| Method | Endpoint       | Description            | Auth |
|--------|----------------|------------------------|------|
| POST   | `/api/photos`  | Upload progress photos | Yes  |
| GET    | `/api/photos`  | Get all photos         | Yes  |

---

## 👤 Author

**Arpit Sharma**

---

## 📄 License

This project is licensed under the MIT License.
