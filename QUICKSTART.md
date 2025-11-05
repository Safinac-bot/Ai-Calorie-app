# CalorieAI - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Firebase account (free tier is fine)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Copy the Firebase config

### Step 3: Configure Environment

Edit `.env` file with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 4: Enable Firebase Services

In Firebase Console:

**Authentication**
- Go to Authentication → Sign-in method
- Enable "Anonymous" provider

**Firestore Database**
- Go to Firestore Database → Create database
- Start in production mode
- Copy/paste these rules:

```javascript
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

**Storage**
- Go to Storage → Get started
- Start in production mode
- Set these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /meals/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 5: Run the App
```bash
npm run dev
```

Visit `http://localhost:5173`

## 🎯 First Use

### Complete Onboarding (3 steps)

**Step 1: Enter Your Info**
- Age: 25
- Sex: Male
- Height: 175 cm (or use converter for 5'9")
- Weight: 70 kg (or use converter for 154 lbs)

**Step 2: Set Goals**
- Activity: Moderate (3-5 days/week)
- Goal: Lose Weight
- Goal Weight: 65 kg
- Rate: 1.0 lbs/week

**Step 3: View Your Plan**
- See your calculated BMR, TDEE, and daily targets
- Review macro breakdown
- Click "Start Tracking"

### Log Your First Meal

1. Click "Log Meal" button on dashboard
2. Upload any food photo (the AI is mocked for now)
3. Review detected foods:
   - Grilled Chicken Breast (6 oz) - 280 cal
   - Brown Rice (1 cup) - 215 cal
   - Steamed Broccoli (1 cup) - 55 cal
4. Adjust portions if needed using +/- buttons
5. Click "Save Meal"

### View Progress

Return to dashboard to see:
- Updated progress rings
- Meal appears in "Today's Meals"
- Real-time calculation of remaining calories/macros

## 📱 Features Overview

### What Works Now
- ✅ Complete onboarding flow with calculations
- ✅ Dashboard with progress tracking
- ✅ Photo upload for meals
- ✅ Mock AI food detection (returns sample foods)
- ✅ Portion adjustment (50%-200%)
- ✅ Meal saving to Firebase
- ✅ Real-time progress updates
- ✅ Unit conversions (cm↔ft, kg↔lbs)

### What's Mocked (For Production)
- ⏳ AI food recognition (currently returns sample data)
- ⏳ Manual food search (placeholder UI shown)
- ⏳ Nutrition database (using hardcoded values)

### Future Enhancements
- Profile editing
- Meal history and analytics
- Weekly/monthly progress charts
- Recipe suggestions
- Export functionality
- Social features

## 🎨 Design Highlights

- **Color Scheme**: Emerald green + Orange for health/energy
- **Responsive**: Works on mobile, tablet, and desktop
- **Animations**: Smooth transitions and progress indicators
- **Modern UI**: Glass-morphism, gradients, shadows
- **Icons**: Lucide React throughout

## 🔧 Development Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 📊 Example Calculations

For a 25-year-old male, 175cm, 70kg, moderate activity, weight loss goal:

- **BMR**: 1,650 cal/day (energy at rest)
- **TDEE**: 2,558 cal/day (with activity)
- **Target**: 2,058 cal/day (500 cal deficit)
- **Macros**: 206g protein, 154g carbs, 69g fat

The app calculates these automatically using scientifically-validated formulas.

## 🆘 Troubleshooting

**"No meals logged yet" on dashboard**
- This is normal for first use
- Click "Log Meal" to add your first meal

**Build errors**
- Run `npm install` to ensure all dependencies installed
- Check that Node.js version is 18+

**Firebase errors**
- Verify environment variables in `.env` are correct
- Check Firebase services are enabled in console
- Ensure security rules are set correctly

**Upload not working**
- Check Firebase Storage is enabled
- Verify Storage security rules allow user uploads
- Ensure file is JPEG/PNG under 10MB

## 📝 Notes

- This uses Firebase Anonymous Authentication for simplicity
- All data is stored per anonymous session
- For production, implement proper email/password auth
- AI food detection is mocked - integrate OpenAI Vision API for production
- Manual search is placeholder - integrate USDA FoodData Central API

## 🎓 Learning Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

---

Need help? Check SETUP.md for detailed Firebase configuration or PROJECT_STRUCTURE.md for code organization.
