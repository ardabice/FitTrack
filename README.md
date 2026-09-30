# FitTrack

FitTrack is a workout and nutrition tracking web application built with React and TypeScript.

The application allows users to log workouts, track meals and macronutrients, search foods using the USDA FoodData Central API, and calculate an estimated daily calorie target based on personal fitness goals.

## Features

### Workout Tracking

- Create, edit and delete workouts
- Strength and cardio workout types
- Add multiple exercises to strength workouts
- Track sets, repetitions, weight and duration
- Track cardio distance and duration
- Search and filter workout history
- View detailed workout information

### Nutrition Tracking

- Add and delete meals
- View nutrition information by date
- Track calories, protein, carbohydrates and fat
- Daily calorie progress
- Meal history

### Food Search

FitTrack integrates with the USDA FoodData Central API.

Users can:

- Search for foods
- Select food database results
- Enter serving size in grams
- Automatically calculate calories, protein, carbohydrates and fat

### Fitness Goal

Users can enter:

- Current weight
- Target weight
- Height
- Age
- Sex
- Activity level

FitTrack then estimates:

- Maintenance calories
- Goal type:
  - Weight Loss
  - Weight Gain
  - Maintain Weight
- Recommended daily calorie target

The calculated calorie target is stored locally in the browser and is also used on the Dashboard.

## Dashboard

The Dashboard provides an overview of:

- Total workouts
- Training time
- Exercises logged
- Training volume
- Recent workouts
- Daily calorie intake
- Daily calorie target
- Protein, carbohydrate and fat intake

## Technologies

- React
- TypeScript
- React Router
- Vite
- HTML5
- CSS3
- REST API
- JSON Server
- USDA FoodData Central API
- Local Storage
- Git
- GitHub

## Installation

Clone the repository:

```bash
git clone https://github.com/ardabice/FitTrack.git
