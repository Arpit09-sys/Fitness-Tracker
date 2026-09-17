# FitTrack - Personal Fitness Tracking Web Application

FitTrack is a simple web application designed to help users log workouts, track daily fitness progress, and monitor basic health metrics like BMI, BMR, daily calorie needs, and water intake.

---

## Features

- **User Accounts**: Register and log in using your email and password. Passwords are securely hashed with BCrypt, and sessions are managed using standard HTTP sessions.
- **Dashboard**: View your current weight, height, goal, BMI with category, estimated BMR, daily calorie recommendation, water intake target, and your last 5 progress entries.
- **Progress Tracking**: Log your daily weight, water intake, workout completion status, and personal notes. Supports adding, editing, and deleting records.
- **Workout Logging**: Record workouts with name, duration (in minutes), notes, and date.
- **Profile Management**: Update personal information including age, height, weight, activity level, and fitness goal.

---

## Tech Stack

- **Backend**: Java 21, Spring Boot (REST API)
- **Database**: MongoDB Atlas, Spring Data MongoDB
- **Password Hashing**: BCrypt (`spring-security-crypto`)
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Architecture**: Simple 3-tier structure (Controller, Model, Repository)

---

## Project Structure

```
Fitness-Tracker/
├── backend/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/fittrack/
│           │       ├── FitTrackApplication.java
│           │       ├── controller/
│           │       │   ├── AuthController.java
│           │       │   ├── ProfileController.java
│           │       │   ├── DashboardController.java
│           │       │   ├── ProgressController.java
│           │       │   └── WorkoutController.java
│           │       ├── model/
│           │       │   ├── User.java
│           │       │   ├── Progress.java
│           │       │   └── Workout.java
│           │       └── repository/
│           │           ├── UserRepository.java
│           │           ├── ProgressRepository.java
│           │           └── WorkoutRepository.java
│           └── resources/
│               ├── application.properties
│               └── static/
│                   ├── index.html
│                   ├── register.html
│                   ├── dashboard.html
│                   ├── profile.html
│                   ├── progress.html
│                   ├── workout.html
│                   ├── css/
│                   │   └── style.css
│                   └── js/
│                       ├── auth.js
│                       ├── dashboard.js
│                       ├── profile.js
│                       ├── progress.js
│                       └── workout.js
├── .env.example
├── .gitignore
└── README.md
```

---

## REST API Endpoints

### Authentication
- `POST /api/auth/signup` — Create a new account
- `POST /api/auth/login` — Sign in to an account
- `POST /api/auth/logout` — End the current session

### Dashboard
- `GET /api/dashboard` — Get calculated metrics and recent progress entries

### Profile
- `GET /api/profile` — Get the logged-in user's profile
- `PUT /api/profile` — Update profile details

### Progress
- `POST /api/progress` — Add a new daily progress entry
- `GET /api/progress` — Get all progress entries for the logged-in user
- `PUT /api/progress/{id}` — Update a progress entry
- `DELETE /api/progress/{id}` — Delete a progress entry

### Workouts
- `POST /api/workout` — Log a new workout
- `GET /api/workout` — Get all logged workouts for the logged-in user

---

## How to Run Locally

### Prerequisites
- Java 17 or Java 21 installed
- Apache Maven installed
- A MongoDB Atlas connection string (or local MongoDB)

### Steps

1. Set your MongoDB connection string in the environment:
   ```bash
   export MONGO_URI="your_mongodb_connection_string"
   ```

2. Navigate to the backend directory and run the application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. Open your browser and go to:
   ```
   http://localhost:8080
   ```

The frontend is served directly by Spring Boot, so no separate frontend server is required.

---

## How It Works

- **Authentication**: When a user registers or logs in, the password is verified using BCrypt. If valid, the user's ID is stored in the standard servlet `HttpSession`. All protected endpoints check this session, ensuring each user only accesses their own data.
- **Calculations**:
  - **BMI**: `weight / (height in meters)²`
  - **BMR (Mifflin-St Jeor)**:
    - Men: `10 × weight + 6.25 × height - 5 × age + 5`
    - Women: `10 × weight + 6.25 × height - 5 × age - 161`
  - **Daily Calories**: `BMR × activity multiplier` (Sedentary: 1.2, Light: 1.375, Moderate: 1.55, Active: 1.725)
  - **Water Goal**: `weight in kg × 35 ml`
