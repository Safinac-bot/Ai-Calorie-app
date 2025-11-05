import { useEffect, useState } from 'react';
import { ArrowLeft, Flame, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingData } from '@/pages/Onboarding';
import { calculateBMR, calculateTDEE, calculateDailyCalories, calculateMacros } from '@/utils/calculations';
import { supabase } from '@/lib/supabase';

interface YourPlanProps {
  data: OnboardingData;
  onComplete: () => void;
  onBack: () => void;
}

export const YourPlan = ({ data, onComplete, onBack }: YourPlanProps) => {
  const [loading, setLoading] = useState(false);
  const [calculations, setCalculations] = useState<{
    bmr: number;
    tdee: number;
    dailyCalories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

  useEffect(() => {
    const bmr = calculateBMR(data.currentWeight, data.height, data.age, data.gender);
    const tdee = calculateTDEE(bmr, data.activityLevel);
    const dailyCalories = calculateDailyCalories(tdee, data.goalType);
    const macros = calculateMacros(dailyCalories, data.goalType);

    setCalculations({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalories: Math.round(dailyCalories),
      ...macros,
    });
  }, [data]);

  const handleStartTracking = async () => {
    if (!calculations) return;

    setLoading(true);
    try {
      const { data: { user: existingUser } } = await supabase.auth.getUser();
      let userId: string;

      if (existingUser) {
        console.log('Using existing user:', existingUser.id);
        userId = existingUser.id;

        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingProfile) {
          console.log('Profile already exists, redirecting to dashboard');
          onComplete();
          return;
        }
      } else {
        const tempEmail = `user_${Date.now()}@caltrack.app`;
        const tempPassword = crypto.randomUUID();

        console.log('Starting signup process...');

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: tempEmail,
          password: tempPassword,
          options: {
            data: {
              is_temp: true
            },
            emailRedirectTo: undefined
          }
        });

        console.log('Auth response:', { authData, authError });

        if (authError) {
          console.error('Auth error:', authError);
          alert(`Failed to create account: ${authError.message}`);
          return;
        }

        if (!authData.user) {
          console.error('No user returned from signup');
          alert('Failed to create account. Please try again.');
          return;
        }

        console.log('User created:', authData.user.id);
        userId = authData.user.id;
      }

      console.log('Attempting to insert profile for user:', userId);

      const profileData = {
        user_id: userId,
        age: data.age,
        gender: data.gender,
        height: data.height,
        current_weight: data.currentWeight,
        goal_weight: data.goalWeight,
        activity_level: data.activityLevel,
        goal_type: data.goalType,
        rate: data.rate,
        bmr: calculations.bmr,
        tdee: calculations.tdee,
        daily_calorie_goal: calculations.dailyCalories,
        daily_protein_goal: calculations.protein,
        daily_carbs_goal: calculations.carbs,
        daily_fat_goal: calculations.fat,
      };

      console.log('Profile data to insert:', profileData);

      const { data: insertedProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select();

      console.log('Insert response:', { insertedProfile, insertError });

      if (insertError) {
        console.error('Error saving user data:', insertError);
        alert(`Failed to save profile: ${insertError.message}`);
        return;
      }

      console.log('Profile saved successfully!');
      onComplete();
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!calculations) return null;

  const cards = [
    {
      icon: Flame,
      title: 'BMR',
      value: calculations.bmr,
      unit: 'cal/day',
      description: 'Calories burned at rest',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: TrendingUp,
      title: 'TDEE',
      value: calculations.tdee,
      unit: 'cal/day',
      description: 'Total daily energy expenditure',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Daily Target',
      value: calculations.dailyCalories,
      unit: 'calories',
      description: 'Your personalized goal',
      gradient: 'from-green-500 to-green-600',
    },
  ];

  const macros = [
    {
      name: 'Protein',
      value: calculations.protein,
      color: 'from-red-500 to-pink-500',
    },
    {
      name: 'Carbs',
      value: calculations.carbs,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      name: 'Fat',
      value: calculations.fat,
      color: 'from-purple-500 to-violet-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <Flame className="w-16 h-16 mx-auto mb-4 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Personalized Plan</h2>
        <p className="text-gray-600">Based on your goals and activity level</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-md border border-gray-100"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.gradient} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-gray-800">{card.value.toLocaleString()}</span>
                <span className="text-sm text-gray-500">{card.unit}</span>
              </div>
              <p className="text-xs text-gray-500">{card.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Macro Targets</h3>
        <div className="grid grid-cols-3 gap-4">
          {macros.map((macro) => (
            <div key={macro.name} className="text-center">
              <div className={`h-2 rounded-full bg-gradient-to-r ${macro.color} mb-3`} />
              <div className="text-2xl font-bold text-gray-800 mb-1">{macro.value}g</div>
              <div className="text-sm text-gray-600">{macro.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These calculations are estimates based on standard formulas. Results may vary based on individual
          metabolism and body composition. Consult a healthcare professional for personalized advice.
        </p>
      </div>

      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleStartTracking}
          disabled={loading}
          className={`flex-1 transition-all ${
            loading
              ? 'bg-red-300 text-white cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {loading ? 'Saving...' : 'Start Tracking'}
        </Button>
      </div>
    </div>
  );
};
