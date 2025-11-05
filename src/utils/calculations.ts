import { Gender, ActivityLevel, GoalType } from '@/types';

export const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number => {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
};

export const getActivityMultiplier = (level: ActivityLevel): number => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    athlete: 1.9,
  };
  return multipliers[level];
};

export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  return bmr * getActivityMultiplier(activityLevel);
};

export const calculateDailyCalories = (tdee: number, goalType: GoalType): number => {
  if (goalType === 'lose_weight') return tdee - 500;
  if (goalType === 'build_muscle') return tdee + 300;
  return tdee;
};

export const calculateMacros = (
  dailyCalories: number,
  goalType: GoalType
): { protein: number; carbs: number; fat: number } => {
  let proteinPercent: number, carbsPercent: number, fatPercent: number;

  if (goalType === 'lose_weight') {
    proteinPercent = 0.4;
    carbsPercent = 0.3;
    fatPercent = 0.3;
  } else if (goalType === 'build_muscle') {
    proteinPercent = 0.35;
    carbsPercent = 0.45;
    fatPercent = 0.2;
  } else {
    proteinPercent = 0.3;
    carbsPercent = 0.4;
    fatPercent = 0.3;
  }

  return {
    protein: Math.round((dailyCalories * proteinPercent) / 4),
    carbs: Math.round((dailyCalories * carbsPercent) / 4),
    fat: Math.round((dailyCalories * fatPercent) / 9),
  };
};

export const convertCmToFeet = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

export const convertFeetToCm = (feet: number, inches: number): number => {
  return Math.round((feet * 12 + inches) * 2.54);
};

export const convertKgToLbs = (kg: number): number => {
  return Math.round(kg * 2.20462 * 10) / 10;
};

export const convertLbsToKg = (lbs: number): number => {
  return Math.round((lbs / 2.20462) * 10) / 10;
};
