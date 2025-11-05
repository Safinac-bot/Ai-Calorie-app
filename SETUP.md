# CalorieAI - Setup Instructions

## Firebase Configuration

This app uses Firebase for authentication, database, and storage. You need to set up a Firebase project before using the app.

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, click on the web icon (</>) to add a web app

### 2. Get Your Firebase Credentials

After creating your web app, you'll see your Firebase configuration. Copy these values.

### 3. Update Environment Variables

Edit the `.env` file in the project root and replace the placeholder values:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Enable Firebase Services

In your Firebase Console:

#### Authentication
1. Go to Authentication → Sign-in method
2. Enable "Anonymous" authentication

#### Firestore Database
1. Go to Firestore Database
2. Create database in production mode
3. Set up security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /meals/{mealId} {
      allow read, write: if request.auth != null &&
                          resource.data.userId == request.auth.uid;
    }
  }
}
```

#### Storage
1. Go to Storage
2. Get started with default settings
3. Set up security rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /meals/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Run the App

```bash
npm install
npm run dev
```

## Features Implemented

### Onboarding Flow
- 3-step wizard with progress indicator
- Basic info: age, sex, height (cm/ft conversion), weight (kg/lbs conversion)
- Activity & goals: activity level selector, goal type cards, goal weight input, rate slider
- Your plan: displays calculated BMR, TDEE, daily calorie target, and macro targets

### Dashboard
- 4 circular progress rings for calories, protein, carbs, and fat
- Color-coded progress (green when within 10% of target, red when over)
- Today's meals list with time, image, food items, and nutrition
- Empty state with beautiful food imagery

### Log Meal
- Photo upload with drag & drop
- Mock AI analysis (returns sample foods)
- Editable food cards with portion adjustment (50%-200%)
- Confidence badges for low-confidence detections
- Manual add option (placeholder)
- Total nutrition summary card
- Save to Firestore

## Calculations

### BMR (Basal Metabolic Rate)
Uses Mifflin-St Jeor equation:
- Men: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
- Women: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

### TDEE (Total Daily Energy Expenditure)
BMR × activity multiplier:
- Sedentary: 1.2
- Light: 1.375
- Moderate: 1.55
- Very Active: 1.725
- Athlete: 1.9

### Daily Calorie Target
- Weight Loss: TDEE - 500
- Maintain: TDEE
- Muscle Gain: TDEE + 300

### Macros
Calculated as percentages of daily calories:
- Weight Loss: Protein 40%, Carbs 30%, Fat 30%
- Maintain: Protein 30%, Carbs 40%, Fat 30%
- Muscle Gain: Protein 35%, Carbs 45%, Fat 20%

Converted to grams: protein/carbs = calories ÷ 4, fat = calories ÷ 9

## Tech Stack

- React 18 + Vite
- TypeScript
- Tailwind CSS + shadcn/ui
- Lucide React icons
- Firebase (Auth, Firestore, Storage)
- React Router DOM
- date-fns for date formatting

## Next Steps (Not Implemented)

To make this a fully production-ready app, you would need to:

1. Integrate OpenAI GPT-4 Vision API for real food recognition
2. Integrate USDA FoodData Central API for accurate nutrition data
3. Implement real manual food search
4. Add user profile editing
5. Add meal history and analytics
6. Add weekly/monthly progress tracking
7. Add export functionality
8. Add social features (meal sharing, etc.)
9. Add recipe suggestions
10. Mobile app versions
