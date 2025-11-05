import { useState } from 'react';
import { ArrowRight, ArrowLeft, Armchair, Bike, Dumbbell, Flame, Zap, TrendingDown, Minus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { OnboardingData } from '@/pages/Onboarding';
import { ActivityLevel, GoalType } from '@/types';

interface ActivityGoalsProps {
  data: Partial<OnboardingData>;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ActivityGoals = ({ data, updateData, onNext, onBack }: ActivityGoalsProps) => {
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(data.activityLevel || 'moderate');
  const [goalType, setGoalType] = useState<GoalType>(data.goalType || 'lose_weight');
  const [goalWeight, setGoalWeight] = useState(data.goalWeight?.toString() || '');
  const [rate, setRate] = useState<number[]>([data.rate || 1]);

  const activities = [
    { value: 'sedentary' as ActivityLevel, label: 'Sedentary', icon: Armchair, desc: 'Little to no exercise' },
    { value: 'light' as ActivityLevel, label: 'Light', icon: Bike, desc: '1-3 days/week' },
    { value: 'moderate' as ActivityLevel, label: 'Moderate', icon: Dumbbell, desc: '3-5 days/week' },
    { value: 'very_active' as ActivityLevel, label: 'Very Active', icon: Flame, desc: '6-7 days/week' },
    { value: 'athlete' as ActivityLevel, label: 'Athlete', icon: Zap, desc: 'Intense daily' },
  ];

  const goals = [
    { value: 'lose_weight' as GoalType, label: 'Lose Weight', icon: TrendingDown, color: 'from-orange-500 to-red-500' },
    { value: 'maintain' as GoalType, label: 'Maintain', icon: Minus, color: 'from-blue-500 to-cyan-500' },
    { value: 'build_muscle' as GoalType, label: 'Build Muscle', icon: TrendingUp, color: 'from-green-500 to-green-600' },
  ];

  const handleNext = () => {
    updateData({
      activityLevel,
      goalType,
      goalWeight: Number(goalWeight),
      rate: rate[0],
    });
    onNext();
  };

  const isValid = activityLevel && goalType && goalWeight && Number(goalWeight) > 0;

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base font-semibold text-gray-700 mb-4 block">Activity Level</Label>
        <div className="grid grid-cols-5 gap-3">
          {activities.map((activity) => {
            const Icon = activity.icon;
            const isSelected = activityLevel === activity.value;
            return (
              <button
                key={activity.value}
                onClick={() => setActivityLevel(activity.value)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-red-600 bg-red-50 shadow-md scale-105'
                    : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-red-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-red-600' : 'text-gray-700'}`}>
                  {activity.label}
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center">{activity.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold text-gray-700 mb-4 block">Goal</Label>
        <div className="grid grid-cols-3 gap-4">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = goalType === goal.value;
            return (
              <button
                key={goal.value}
                onClick={() => setGoalType(goal.value)}
                className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-red-600 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-red-300 hover:shadow-md'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-gradient-to-r ${
                    isSelected ? goal.color : 'from-gray-300 to-gray-400'
                  }`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <span className={`text-base font-medium ${isSelected ? 'text-red-600' : 'text-gray-700'}`}>
                  {goal.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="goalWeight" className="text-base font-semibold text-gray-700">
          Goal Weight (kg)
        </Label>
        <Input
          id="goalWeight"
          type="number"
          value={goalWeight}
          onChange={(e) => setGoalWeight(e.target.value)}
          className="mt-2"
          placeholder="Enter your goal weight"
        />
      </div>

      {goalType === 'lose_weight' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="text-base font-semibold text-gray-700">Desired Rate</Label>
            <span className="text-sm font-medium text-red-600">{rate[0]} lbs/week</span>
          </div>
          <Slider
            value={rate}
            onValueChange={setRate}
            min={0.5}
            max={2}
            step={0.25}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Slow (0.5)</span>
            <span>Moderate (1.0)</span>
            <span>Aggressive (2.0)</span>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className={`flex-1 transition-all ${
            isValid
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-300 text-white cursor-not-allowed'
          }`}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
