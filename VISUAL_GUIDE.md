# Quick Start - Upload Demo Video

## First, Start the Dev Server

Open your terminal in the project folder and run:

```bash
npm run dev
```

The app will start at `http://localhost:5173`

## Upload Your Demo Video

1. **Make sure dev server is running** (see above)
2. **Go to** `http://localhost:5173/upload-video`
3. **Click** "Select Video File"
4. **Choose** your video file (download from Google Drive first if needed)
5. **Copy** the URL that appears after successful upload
6. **Open** `src/pages/Landing.tsx` in your code editor
7. **Find** line 511 with `YOUR_VIDEO_URL_HERE.mp4`
8. **Replace** it with the URL you copied
9. **Save** the file

## Test the Video

1. Go to `http://localhost:5173`
2. Click "Watch Demo" button
3. Video should play inline in the modal

That's it! The video will work on mobile apps too - no redirects, plays inline.

---

# CalorieAI - Visual Guide

## Color Scheme

The app uses a fresh, health-focused color palette:

- **Primary**: Emerald Green (#10b981, #059669) - represents health, growth, success
- **Accent**: Orange (#f97316, #ea580c) - represents energy, nutrition
- **Background**: Soft gradients from emerald-50 → white → orange-50
- **Text**: Gray-800 for headings, gray-600 for body, gray-500 for captions

## Page Layouts

### 1. Onboarding Flow

#### Progress Indicator (Top of page)
```
┌─────────────────────────────────────────────────┐
│  [●] Basic Info ─────── [○] Activity ─── [○] Plan │
└─────────────────────────────────────────────────┘
```

#### Step 1: Basic Info
```
┌─────────────────────────────────────┐
│ Age: [_______] (18-100)            │
│                                     │
│ Sex: (●) Male  ( ) Female  ( ) Other│
│                                     │
│ Height:        [170] cm  ↔️ Switch   │
│                                     │
│ Weight:        [70] kg  ↔️ Switch    │
│                                     │
│         [Next →]                    │
└─────────────────────────────────────┘
```

#### Step 2: Activity & Goals
```
Activity Level:
┌──────┬──────┬──────┬──────┬──────┐
│  🪑  │  🚴  │  🏋️  │  🔥  │  ⚡  │
│ Sed. │Light │ Mod. │V.Act │Athlt │
└──────┴──────┴──────┴──────┴──────┘

Goal:
┌────────────┬────────────┬────────────┐
│     📉     │     ➖     │     📈     │
│ Lose Weight│  Maintain  │Build Muscle│
└────────────┴────────────┴────────────┘

Goal Weight: [______] kg

Rate: [────●────] 1.0 lbs/week
      Slow  Moderate  Aggressive

[← Back]  [Next →]
```

#### Step 3: Your Plan
```
┌──────────────────────────────────────────┐
│           🍎 Your Plan                   │
│                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │ 🔥 BMR │  │ 📈TDEE │  │🎯Target│    │
│  │  1,650 │  │ 2,550  │  │ 2,050  │    │
│  │cal/day │  │cal/day │  │calories│    │
│  └────────┘  └────────┘  └────────┘    │
│                                          │
│  Daily Macro Targets:                   │
│  ▓▓▓▓▓▓ Protein: 205g                   │
│  ▓▓▓▓▓▓ Carbs:   154g                   │
│  ▓▓▓▓▓▓ Fat:     68g                    │
│                                          │
│  [← Back]  [Start Tracking]             │
└──────────────────────────────────────────┘
```

### 2. Dashboard

```
┌─────────────────────────────────────────────────┐
│ Friday, November 2           [⚙️]              │
│ Track your nutrition journey                    │
│                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │    ◐    │ │    ◐    │ │    ◐    │ │    ◐    │ │
│  │ 1,240   │ │   42g   │ │   156g  │ │   38g   │ │
│  │ 1,800   │ │   205g  │ │   154g  │ │   68g   │ │
│  │         │ │         │ │         │ │         │ │
│  │Calories │ │ Protein │ │  Carbs  │ │   Fat   │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│                                                 │
│       ┌──────────────────────────┐             │
│       │      📷 Log Meal         │             │
│       └──────────────────────────┘             │
│                                                 │
│  ┌─ Today's Meals ──────────────────────────┐ │
│  │                                           │ │
│  │ ┌─┬──────────────────────────────┬─────┐ │ │
│  │ │📷│ 🕐 8:30 AM                  │ 280 │ │ │
│  │ │ │ Grilled Chicken, Rice       │ cal │ │ │
│  │ │ │ P: 53g • C: 45g • F: 8g    │     │ │ │
│  │ └─┴──────────────────────────────┴─────┘ │ │
│  │                                           │ │
│  │ ┌─┬──────────────────────────────┬─────┐ │ │
│  │ │📷│ 🕐 12:45 PM                 │ 550 │ │ │
│  │ │ │ Salmon Bowl, Avocado        │ cal │ │ │
│  │ │ │ P: 38g • C: 52g • F: 24g   │     │ │ │
│  │ └─┴──────────────────────────────┴─────┘ │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 3. Log Meal (Initial State)

```
┌─────────────────────────────────────────────┐
│ [←] Log Meal                                │
│     Upload a photo or add items manually    │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │            📤 Upload                    │ │
│ │                                         │ │
│ │   Drag photo here or click to browse   │ │
│ │                                         │ │
│ │     JPEG or PNG, max 10MB              │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 4. Log Meal (After Upload)

```
┌──────────────────────────────────────────────┐
│ [←] Log Meal                                 │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │     [Food Photo Preview]                 │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌─ Grilled Chicken Breast ──────────── [🗑]┐│
│ │ 6 oz                        [⚠️ 89%]     ││
│ │                                          ││
│ │  280 cal   53g    0g    6g              ││
│ │           Protein Carbs  Fat            ││
│ │                                          ││
│ │       [-]  100% portion  [+]            ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ┌─ Brown Rice ────────────────────── [🗑]  │
│ │ 1 cup                       [✓ 92%]     ││
│ │                                          ││
│ │  215 cal    5g   45g    2g              ││
│ │           Protein Carbs  Fat            ││
│ │                                          ││
│ │       [-]  100% portion  [+]            ││
│ └──────────────────────────────────────────┘│
│                                              │
│      [+ Add Item Manually]                  │
│                                              │
│ ┌─ Total Nutrition ──────────────────────┐  │
│ │  550 cal   58g   45g    8g            │  │
│ │         Protein  Carbs  Fat           │  │
│ └──────────────────────────────────────────┘ │
│                                              │
│         [💾 Save Meal]                       │
└──────────────────────────────────────────────┘
```

## Interactive Elements

### Circular Progress Rings
- Animated stroke fills from 0% to current percentage
- Color changes based on progress:
  - Gray (#9ca3af): significantly under target
  - Green (#10b981): within 10% of target
  - Red (#ef4444): over target by 10%+
- Shows current/target values in center

### Buttons
- Primary: Gradient emerald background, white text, shadow
- Outline: White background, emerald border, hover effects
- Ghost: Transparent, hover shows background
- Icon: Square, icon only, subtle hover

### Cards
- White background with subtle shadow
- Rounded corners (12-24px)
- Hover effects: slight lift, border color change
- Glass-morphism on overlays

### Forms
- Labels: semibold, gray-700
- Inputs: rounded border, focus ring in emerald
- Radio buttons: custom styled with emerald accent
- Sliders: emerald track with white handle

### Transitions
- All interactive elements: 200ms ease
- Progress animations: 500ms ease-out
- Page transitions: smooth fade
- Hover effects: scale and color changes

## Responsive Breakpoints

- **Mobile** (<640px): Single column, full width cards
- **Tablet** (640-1024px): 2 columns for grids, adapted spacing
- **Desktop** (>1024px): Full multi-column layouts

## Iconography

Using Lucide React icons throughout:
- User, Target, TrendingUp (onboarding steps)
- Flame (calories/BMR)
- TrendingUp (TDEE)
- Target (daily target)
- Camera (log meal, photo)
- Settings (dashboard)
- Clock (meal time)
- Plus, Minus (portion adjustment)
- Trash (delete)
- AlertCircle (confidence warning)
- Save (save meal)
- ArrowLeft, ArrowRight (navigation)
- ArrowLeftRight (unit conversion)
- Armchair, Bike, Dumbbell, Flame, Zap (activity levels)
- TrendingDown (lose weight)
- Minus (maintain)
- TrendingUp (build muscle)
- Apple (your plan)

## Empty States

Dashboard empty state features:
- Beautiful Unsplash food photo background
- "No meals logged yet" heading
- Encouraging subtext
- Prominent "Log Meal" button above
