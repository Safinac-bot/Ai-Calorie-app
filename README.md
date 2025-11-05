# 🍎 CalorieAI - AI-Powered Calorie Tracking App

A beautiful, production-ready calorie tracking web application built with React, Firebase, and AI-powered food recognition. Track your nutrition goals with an intuitive interface and personalized meal plans.

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10.x-orange?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)

## ✨ Features

### 🎯 Personalized Onboarding
- **3-Step Wizard** with beautiful progress tracking
- **Smart Calculations** using Mifflin-St Jeor BMR formula
- **Unit Conversions** - seamlessly switch between metric and imperial
- **Activity Levels** - from sedentary to athlete
- **Goal Setting** - lose weight, maintain, or build muscle

### 📊 Dashboard
- **Real-time Progress Tracking** with circular progress rings
- **Color-coded Goals** - green (on track), red (exceeded), gray (under)
- **Today's Meals** - view all logged meals with nutrition breakdown
- **Beautiful Empty States** - encouraging imagery when starting out

### 📸 Photo Meal Logging
- **Drag & Drop Upload** - easy photo uploads (JPEG/PNG up to 10MB)
- **AI Food Detection** - automatically identifies foods in photos (mocked for demo)
- **Portion Adjustment** - scale portions from 50% to 200%
- **Nutrition Breakdown** - instant calories, protein, carbs, and fat
- **Confidence Scores** - see AI detection confidence levels

### 🎨 Modern Design
- **Emerald Green & Orange** color scheme for health and energy
- **Glass-morphism Effects** and smooth animations
- **Mobile-First Responsive** - works on all devices
- **40+ shadcn/ui Components** - production-ready UI library
- **Lucide Icons** - beautiful, consistent iconography

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account (free tier works great)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Safinac-bot/Ai-Calorie-app.git
   cd Ai-Calorie-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Anonymous), Firestore Database, and Storage
   - Copy your Firebase config

4. **Configure environment variables**

   Edit `.env` file:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

5. **Run the app**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5173` and start tracking!

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[SETUP.md](./SETUP.md)** - Detailed Firebase setup and security rules
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Code organization and architecture
- **[VISUAL_GUIDE.md](./VISUAL_GUIDE.md)** - UI layouts and design system

## 🧮 How It Works

### BMR Calculation (Mifflin-St Jeor Equation)
- **Men**: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
- **Women**: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

### TDEE (Total Daily Energy Expenditure)
BMR × Activity Multiplier:
- Sedentary: 1.2
- Light Activity: 1.375
- Moderate Activity: 1.55
- Very Active: 1.725
- Athlete: 1.9

### Daily Calorie Goals
- **Weight Loss**: TDEE - 500 calories
- **Maintenance**: TDEE
- **Muscle Gain**: TDEE + 300 calories

### Macro Distribution
Automatically calculated based on your goals:
- **Weight Loss**: 40% protein, 30% carbs, 30% fat
- **Maintenance**: 30% protein, 40% carbs, 30% fat
- **Muscle Gain**: 35% protein, 45% carbs, 20% fat

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **date-fns** - Date formatting

### Backend
- **Firebase Authentication** - Anonymous auth
- **Firestore** - NoSQL database
- **Firebase Storage** - Image storage

### Development
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **PostCSS** - CSS processing

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   └── CircularProgress.tsx
│   ├── onboarding/
│   │   ├── BasicInfo.tsx
│   │   ├── ActivityGoals.tsx
│   │   └── YourPlan.tsx
│   └── ui/                      # 40+ shadcn components
├── lib/
│   ├── firebase.ts              # Firebase config
│   └── utils.ts                 # Utilities
├── pages/
│   ├── Dashboard.tsx            # Main dashboard
│   ├── LogMeal.tsx              # Meal logging
│   └── Onboarding.tsx           # Onboarding flow
├── types/
│   └── index.ts                 # TypeScript types
├── utils/
│   └── calculations.ts          # BMR/TDEE/macros
├── App.tsx                      # Router setup
└── main.tsx                     # Entry point
```

## 🔐 Security

- **Row Level Security** - Firestore rules ensure users only access their own data
- **Anonymous Authentication** - Quick start without signup friction
- **Secure Storage** - Images stored in user-specific folders
- **Environment Variables** - Sensitive config kept secure

## 🎯 Roadmap

### Current Features (v1.0)
- ✅ Complete onboarding with calculations
- ✅ Dashboard with progress tracking
- ✅ Photo upload for meals
- ✅ Mock AI food detection
- ✅ Portion adjustment
- ✅ Real-time progress updates

### Planned Features
- 🔄 OpenAI GPT-4 Vision API integration for real food recognition
- 🔄 USDA FoodData Central API for accurate nutrition data
- 🔄 Manual food search and database
- 🔄 Profile editing
- 🔄 Weekly/monthly analytics
- 🔄 Progress charts and trends
- 🔄 Recipe suggestions
- 🔄 Social features and meal sharing
- 🔄 Export functionality
- 🔄 Mobile apps (iOS/Android)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful component library
- **Lucide** - Icon set
- **Firebase** - Backend services
- **Tailwind CSS** - Utility-first CSS framework
- **React** - UI library

## 📧 Contact

Safinac - [@Safinac-bot](https://github.com/Safinac-bot)

Project Link: [https://github.com/Safinac-bot/Ai-Calorie-app](https://github.com/Safinac-bot/Ai-Calorie-app)

---

⭐ Star this repo if you find it helpful!

## 🖼️ Screenshots

### Onboarding Flow
Beautiful 3-step wizard that calculates your personalized nutrition plan.

### Dashboard
Track your daily progress with intuitive circular progress rings and meal history.

### Meal Logging
Upload food photos and let AI detect the foods with nutrition information.

---

**Built with ❤️ using React, Firebase, and modern web technologies**
