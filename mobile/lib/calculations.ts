export const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
): number => {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very-active': 1.9,
  };

  return bmr * (activityMultipliers[activityLevel] || 1.2);
};

export const calculateCalorieGoal = (
  tdee: number,
  goal: 'lose' | 'maintain' | 'gain'
): number => {
  switch (goal) {
    case 'lose':
      return Math.round(tdee - 500);
    case 'gain':
      return Math.round(tdee + 500);
    case 'maintain':
    default:
      return Math.round(tdee);
  }
};

export const calculateMacros = (calories: number) => {
  const protein = Math.round((calories * 0.3) / 4);
  const carbs = Math.round((calories * 0.4) / 4);
  const fat = Math.round((calories * 0.3) / 9);

  return { protein, carbs, fat };
};
