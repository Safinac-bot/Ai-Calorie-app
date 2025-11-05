import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { UserProfile, GoalType, ActivityLevel } from '@/types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { calculateBMR, calculateTDEE, calculateDailyCalories, calculateMacros } from '@/utils/calculations';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onUpdate: () => void;
}

export const SettingsDialog = ({ open, onOpenChange, profile, onUpdate }: SettingsDialogProps) => {
  const [goalType, setGoalType] = useState<GoalType>(profile.goalType);
  const [goalWeight, setGoalWeight] = useState(profile.goalWeight.toString());
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [rate, setRate] = useState(profile.rate.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const bmr = calculateBMR(profile.currentWeight, profile.height, profile.age, profile.gender);
      const tdee = calculateTDEE(bmr, activityLevel);
      const dailyCalorieGoal = calculateDailyCalories(tdee, goalType);
      const macros = calculateMacros(dailyCalorieGoal, goalType);

      const { error } = await supabase
        .from('user_profiles')
        .update({
          goal_type: goalType,
          goal_weight: Number(goalWeight),
          activity_level: activityLevel,
          rate: Number(rate),
          bmr,
          tdee,
          daily_calorie_goal: dailyCalorieGoal,
          daily_protein_goal: macros.protein,
          daily_carbs_goal: macros.carbs,
          daily_fat_goal: macros.fat,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', profile.userId);

      if (error) throw error;

      toast.success('Fitness goals updated successfully!');
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating goals:', error);
      toast.error('Failed to update goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getRateLabel = () => {
    if (goalType === 'lose_weight') return 'Weight Loss Rate (kg/week)';
    if (goalType === 'build_muscle') return 'Weight Gain Rate (kg/week)';
    return 'Rate';
  };

  const getRatePlaceholder = () => {
    if (goalType === 'lose_weight') return '0.5';
    if (goalType === 'build_muscle') return '0.25';
    return '0';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Change Fitness Goals</DialogTitle>
          <DialogDescription>
            Update your fitness goals and activity level to recalculate your daily targets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label className="text-base font-semibold text-gray-700 mb-3 block">
              What's your primary goal?
            </Label>
            <RadioGroup value={goalType} onValueChange={(value) => setGoalType(value as GoalType)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-red-600 transition-colors">
                  <RadioGroupItem value="lose_weight" id="lose_weight" />
                  <Label htmlFor="lose_weight" className="cursor-pointer flex-1 font-medium">
                    Lose Weight
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-red-600 transition-colors">
                  <RadioGroupItem value="maintain" id="maintain" />
                  <Label htmlFor="maintain" className="cursor-pointer flex-1 font-medium">
                    Maintain Weight
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-red-600 transition-colors">
                  <RadioGroupItem value="build_muscle" id="build_muscle" />
                  <Label htmlFor="build_muscle" className="cursor-pointer flex-1 font-medium">
                    Build Muscle / Gain Weight
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {goalType !== 'maintain' && (
            <>
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
                  placeholder="70"
                />
              </div>

              <div>
                <Label htmlFor="rate" className="text-base font-semibold text-gray-700">
                  {getRateLabel()}
                </Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="mt-2"
                  placeholder={getRatePlaceholder()}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {goalType === 'lose_weight'
                    ? 'Recommended: 0.5-1 kg per week for sustainable weight loss'
                    : 'Recommended: 0.25-0.5 kg per week for lean muscle gain'}
                </p>
              </div>
            </>
          )}

          <div>
            <Label className="text-base font-semibold text-gray-700 mb-3 block">
              Activity Level
            </Label>
            <RadioGroup value={activityLevel} onValueChange={(value) => setActivityLevel(value as ActivityLevel)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-red-600 transition-colors">
                  <RadioGroupItem value="sedentary" id="sedentary" />
                  <div className="flex-1 cursor-pointer" onClick={() => setActivityLevel('sedentary')}>
                    <Label htmlFor="sedentary" className="cursor-pointer font-medium block">
                      Sedentary
                    </Label>
                    <p className="text-sm text-gray-500">Little or no exercise</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-red-600 transition-colors">
                  <RadioGroupItem value="light" id="light" />
                  <div className="flex-1 cursor-pointer" onClick={() => setActivityLevel('light')}>
                    <Label htmlFor="light" className="cursor-pointer font-medium block">
                      Lightly Active
                    </Label>
                    <p className="text-sm text-gray-500">Exercise 1-3 times/week</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-red-600 transition-colors">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <div className="flex-1 cursor-pointer" onClick={() => setActivityLevel('moderate')}>
                    <Label htmlFor="moderate" className="cursor-pointer font-medium block">
                      Moderately Active
                    </Label>
                    <p className="text-sm text-gray-500">Exercise 4-5 times/week</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-red-600 transition-colors">
                  <RadioGroupItem value="very_active" id="very_active" />
                  <div className="flex-1 cursor-pointer" onClick={() => setActivityLevel('very_active')}>
                    <Label htmlFor="very_active" className="cursor-pointer font-medium block">
                      Very Active
                    </Label>
                    <p className="text-sm text-gray-500">Daily exercise or intense 3-4 times/week</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:border-red-600 transition-colors">
                  <RadioGroupItem value="athlete" id="athlete" />
                  <div className="flex-1 cursor-pointer" onClick={() => setActivityLevel('athlete')}>
                    <Label htmlFor="athlete" className="cursor-pointer font-medium block">
                      Athlete
                    </Label>
                    <p className="text-sm text-gray-500">Intense exercise 6-7 times/week</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
