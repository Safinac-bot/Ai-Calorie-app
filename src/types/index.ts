export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete';
export type GoalType = 'lose_weight' | 'maintain' | 'build_muscle';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  id: string;
  userId: string;
  age: number;
  gender: Gender;
  height: number;
  currentWeight: number;
  goalWeight: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  rate: number;
  bmr: number;
  tdee: number;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbsGoal: number;
  dailyFatGoal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealItem {
  id: string;
  mealId: string;
  foodName: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
}

export interface Meal {
  id: string;
  userId: string;
  mealDate: string;
  mealType: MealType;
  photoUrl?: string;
  notes?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: Date;
  updatedAt: Date;
  items?: MealItem[];
}

export interface DailyTotals {
  id: string;
  userId: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  updatedAt: Date;
}

export interface DailyProgress {
  date: string;
  caloriesGoal: number;
  caloriesConsumed: number;
  caloriesRemaining: number;
  caloriesPercentage: number;
  proteinGoal: number;
  proteinConsumed: number;
  proteinRemaining: number;
  proteinPercentage: number;
  carbsGoal: number;
  carbsConsumed: number;
  carbsRemaining: number;
  carbsPercentage: number;
  fatGoal: number;
  fatConsumed: number;
  fatRemaining: number;
  fatPercentage: number;
}
