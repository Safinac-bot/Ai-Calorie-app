# Firehouse Fit Mobile App

React Native iOS mobile app built with Expo for Firehouse Fit nutrition tracking.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or physical iOS device
- Apple Developer account (for App Store deployment)

## Getting Started

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

Update the following values in `.env`:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `EXPO_PUBLIC_OPENAI_API_KEY` - Your OpenAI API key

### 3. Run the App

Start the development server:

```bash
npm start
```

Then:
- Press `i` to open in iOS Simulator
- Scan the QR code with Expo Go app on your physical iOS device

## Project Structure

```
mobile/
├── app/                    # Expo Router file-based routing
│   ├── (auth)/            # Authentication flow screens
│   │   ├── landing.tsx    # Landing page
│   │   ├── auth.tsx       # Login/signup
│   │   └── pricing.tsx    # Pricing plans
│   ├── (app)/             # Main app screens (protected)
│   │   ├── onboarding.tsx # User onboarding
│   │   ├── dashboard.tsx  # Main dashboard
│   │   ├── log-meal.tsx   # Meal scanning with camera
│   │   └── admin.tsx      # Admin statistics
│   └── _layout.tsx        # Root layout with auth routing
├── lib/                   # Shared utilities
│   ├── supabase.ts       # Supabase client
│   ├── calculations.ts   # BMR/TDEE calculations
│   └── foodRecognition.ts # OpenAI food analysis
├── app.json              # Expo configuration
└── package.json          # Dependencies

```

## Features

### Authentication
- Email/password login and signup
- Automatic session management
- Protected routes with automatic redirects

### Onboarding
- Multi-step user profile setup
- BMR and TDEE calculations
- Activity level and goal selection
- Personalized macro calculations

### Dashboard
- Daily calorie and macro tracking
- Visual progress indicators
- Pull-to-refresh functionality
- Quick access to meal scanning

### Meal Logging
- Camera integration for meal photos
- Photo library selection
- AI-powered food recognition with OpenAI
- Automatic nutritional analysis
- Detailed breakdown per food item
- Save meals to Supabase database

### Admin Statistics
- Total user count
- New users (today, week, month)
- Total meals logged
- Average meals per user
- Growth rate calculations

## Building for iOS

### Development Build

```bash
npx expo run:ios
```

### Production Build

1. Configure your app identifier in `app.json`:
```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.firehousefit"
  }
}
```

2. Build for App Store:
```bash
eas build --platform ios
```

3. Submit to App Store:
```bash
eas submit --platform ios
```

## Required iOS Permissions

The app requests the following permissions:
- Camera: For scanning meal photos
- Photo Library: For selecting existing photos

These are configured in `app.json` under `ios.infoPlist`.

## App Store Submission

### Prerequisites
1. Apple Developer account (99/year)
2. App Store Connect setup
3. App icons and screenshots prepared
4. Privacy policy URL
5. App description and metadata

### Steps
1. Create app in App Store Connect
2. Build production version with EAS
3. Upload to App Store Connect
4. Fill in app metadata
5. Submit for review

## Database

The mobile app uses the same Supabase database as the web app:
- `user_profiles` - User information and goals
- `meals` - Logged meals
- `meal_items` - Individual food items per meal

All RLS policies from the web app apply to the mobile app.

## Troubleshooting

### Camera not working in simulator
iOS Simulator doesn't support camera. Use a physical device or select from photo library.

### Module not found errors
```bash
rm -rf node_modules
npm install
```

### Expo Go limitations
For full camera functionality, build a development client:
```bash
npx expo run:ios
```

### OpenAI API errors
Ensure your API key is valid and has sufficient credits. Check the console for detailed error messages.

## Tech Stack

- Expo 50
- React Native 0.73
- Expo Router (file-based routing)
- TypeScript
- Supabase (authentication and database)
- OpenAI GPT-4 Vision (food recognition)
- React Navigation
- Expo Camera & Image Picker

## License

Private - All rights reserved
