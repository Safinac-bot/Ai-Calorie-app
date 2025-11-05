# CalorieAI - Project Structure

## File Organization

```
src/
├── components/
│   ├── dashboard/
│   │   └── CircularProgress.tsx      # Circular progress ring component
│   ├── onboarding/
│   │   ├── BasicInfo.tsx             # Step 1: Age, sex, height, weight
│   │   ├── ActivityGoals.tsx         # Step 2: Activity level, goal, goal weight, rate
│   │   └── YourPlan.tsx              # Step 3: BMR, TDEE, calorie target, macros
│   └── ui/                           # shadcn/ui components (40+ components)
├── lib/
│   ├── firebase.ts                   # Firebase initialization and exports
│   └── utils.ts                      # shadcn utility functions
├── pages/
│   ├── Dashboard.tsx                 # Main app screen with progress rings and meals
│   ├── LogMeal.tsx                   # Photo upload and meal logging
│   └── Onboarding.tsx                # 3-step onboarding wizard
├── types/
│   └── index.ts                      # TypeScript interfaces and types
├── utils/
│   └── calculations.ts               # BMR, TDEE, macros, unit conversions
├── App.tsx                           # Main app with routing
├── App.css                           # App-level styles
├── index.css                         # Global styles and Tailwind
└── main.tsx                          # React entry point
```

## Key Features by Page

### Onboarding (`/onboarding`)
- **Step 1 - Basic Info**: Collects age (18-100), sex (male/female/other), height with cm↔ft conversion, weight with kg↔lbs conversion
- **Step 2 - Activity & Goals**: 5 activity levels, 3 goal types with icons, goal weight input, rate slider for weight loss
- **Step 3 - Your Plan**: Displays calculated BMR, TDEE, daily calorie target, and macro breakdown (protein, carbs, fat)
- Saves complete user profile to Firebase Firestore
- Anonymous authentication on completion

### Dashboard (`/`)
- Date header with settings icon
- 4 circular progress rings for calories, protein, carbs, fat
- Color-coded progress (green when within 10%, red when over, gray when under)
- Large "Log Meal" button with camera icon
- Today's meals section with:
  - Time, thumbnail, food items, nutrition summary
  - Empty state with Unsplash food photo
- Loads user profile and today's meals from Firebase
- Redirects to onboarding if no profile exists

### Log Meal (`/log-meal`)
- File upload zone with drag & drop support
- Image preview after upload
- Loading state: "AI analyzing your meal..."
- Mock AI response with 3 sample foods
- Editable food cards showing:
  - Food name and portion size
  - Calories, protein, carbs, fat
  - +/- buttons for portion adjustment (50%-200%)
  - Delete button
  - Confidence badge for <85% confidence
- "Add Item Manually" button (placeholder)
- Total nutrition summary card
- Save button uploads photo to Firebase Storage and saves meal data to Firestore

## Data Models

### User Profile (Firestore: `users/{userId}`)
```typescript
{
  userId: string
  age: number
  sex: 'male' | 'female' | 'other'
  height: number (cm)
  currentWeight: number (kg)
  goalWeight: number (kg)
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete'
  goalType: 'lose' | 'maintain' | 'gain'
  rate: number (lbs/week)
  bmr: number
  tdee: number
  dailyCalorieTarget: number
  proteinTarget: number (g)
  carbsTarget: number (g)
  fatTarget: number (g)
  createdAt: Date
}
```

### Meal (Firestore: `meals/{mealId}`)
```typescript
{
  mealId: string
  userId: string
  timestamp: Date
  photoUrl: string (optional)
  foods: [
    {
      name: string
      portion: string
      calories: number
      protein: number (g)
      carbs: number (g)
      fat: number (g)
    }
  ]
  totalCalories: number
  totalProtein: number (g)
  totalCarbs: number (g)
  totalFat: number (g)
}
```

## Design System

### Colors
- **Primary**: Emerald green (`#10b981`, `#059669`)
- **Secondary**: Orange (`#f97316`, `#ea580c`)
- **Success**: Green (`#10b981`)
- **Error**: Red (`#ef4444`)
- **Background**: Gradient from emerald-50 via white to orange-50

### Typography
- Headings: Bold, large sizes with gradient text for main titles
- Body: Inter font family, regular weight
- Labels: Semibold, gray-700 color

### Components
- Rounded corners: 8-16px (rounded-lg to rounded-2xl)
- Shadows: Subtle on cards, stronger on active/hover states
- Transitions: 200-300ms duration for smooth interactions
- Glass-morphism effects on overlays

### Spacing
- Container max-width: 1280px (4xl), 1024px (6xl)
- Padding: 4-8 spacing units (1rem-2rem)
- Gap: 4-6 spacing units between grid items

## Responsive Design

All pages are mobile-first responsive:
- Grid layouts adapt from columns to stacked on mobile
- Progress rings maintain size on all screens
- Forms use full width on mobile, centered on desktop
- Touch-friendly button sizes (min 44x44px)

## State Management

- Local React state for form inputs and UI state
- Firebase Authentication for user sessions
- Firestore for persistent data storage
- URL-based routing with React Router

## API Integration Points (Not Implemented)

For production, integrate:
1. **OpenAI GPT-4 Vision API**: Replace `analyzeMeal()` mock with actual image analysis
2. **USDA FoodData Central API**: Replace mock food data with real nutrition database
3. **Manual search**: Implement food search with real API

## Performance Optimizations

- Lazy load images with proper sizing
- Memoize calculations where appropriate
- Debounce search inputs
- Optimize Firestore queries with indexes
- Use Firebase Storage CDN for images

## Security

- Anonymous authentication required for all operations
- Firestore rules restrict read/write to authenticated user's data only
- Storage rules restrict uploads to user's own folder
- Environment variables for Firebase credentials
- Input validation on all forms
