import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, Camera, Flame, UtensilsCrossed, LogOut, Zap, Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CircularProgress } from '@/components/dashboard/CircularProgress';
import { QuickScan } from '@/components/dashboard/QuickScan';
import { SettingsDialog } from '@/components/dashboard/SettingsDialog';
import { supabase } from '@/lib/supabase';
import { UserProfile, Meal } from '@/types';
import { format } from 'date-fns';

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [quickScanOpen, setQuickScanOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        console.log('Dashboard - Current user:', user);

        if (!user) {
          console.log('No user found, redirecting to landing page');
          navigate('/');
          return;
        }

        console.log('Fetching profile for user:', user.id);

        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('Profile query result:', { profileData, profileError });

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          navigate('/onboarding');
          return;
        }

        if (!profileData) {
          console.log('No profile found, redirecting to onboarding');
          navigate('/onboarding');
          return;
        }

        const userData: UserProfile = {
          id: profileData.id,
          userId: profileData.user_id,
          age: profileData.age,
          gender: profileData.gender,
          height: profileData.height,
          currentWeight: profileData.current_weight,
          goalWeight: profileData.goal_weight,
          activityLevel: profileData.activity_level,
          goalType: profileData.goal_type,
          rate: profileData.rate,
          bmr: profileData.bmr,
          tdee: profileData.tdee,
          dailyCalorieGoal: profileData.daily_calorie_goal,
          dailyProteinGoal: profileData.daily_protein_goal,
          dailyCarbsGoal: profileData.daily_carbs_goal,
          dailyFatGoal: profileData.daily_fat_goal,
          createdAt: new Date(profileData.created_at),
          updatedAt: new Date(profileData.updated_at),
        };
        setProfile(userData);

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayFormatted = `${year}-${month}-${day}`;

        console.log('Fetching meals for user:', user.id, 'date:', todayFormatted, 'Local date:', now.toLocaleDateString(), 'UTC:', now.toISOString());

        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .eq('meal_date', todayFormatted)
          .order('created_at', { ascending: false });

        console.log('Meals query result:', {
          mealsData,
          mealsError,
          count: mealsData?.length,
          userId: user.id,
          date: todayFormatted
        });

        if (mealsError) throw mealsError;

        const meals: Meal[] = (mealsData || []).map((meal) => ({
          id: meal.id,
          userId: meal.user_id,
          mealDate: meal.meal_date,
          mealType: meal.meal_type,
          photoUrl: meal.photo_url,
          notes: meal.notes,
          totalCalories: meal.total_calories,
          totalProtein: meal.total_protein,
          totalCarbs: meal.total_carbs,
          totalFat: meal.total_fat,
          createdAt: new Date(meal.created_at),
          updatedAt: new Date(meal.updated_at),
        }));

        console.log('Processed meals:', meals);

        setMeals(meals);

        const totalsData = meals.reduce(
          (acc, meal) => ({
            calories: acc.calories + meal.totalCalories,
            protein: acc.protein + meal.totalProtein,
            carbs: acc.carbs + meal.totalCarbs,
            fat: acc.fat + meal.totalFat,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        console.log('Calculated totals:', totalsData);

        setTotals(totalsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, refreshKey]);

  useEffect(() => {
    if (location.state?.refresh) {
      console.log('Refresh triggered from navigation state');
      setRefreshKey(prev => prev + 1);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const getProgressColor = (current: number, target: number): string => {
    const percentage = (current / target) * 100;
    if (percentage > 110) return '#ef4444';
    if (percentage >= 90 && percentage <= 110) return '#10b981';
    if (percentage >= 70) return '#f59e0b';
    return '#9ca3af';
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="sticky top-0 z-10 bg-gray-50 pb-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-8 h-8 text-red-600" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-red-600 leading-tight">Firehouse Fit</span>
                <span className="text-xs text-gray-600 leading-tight">AI Calorie & Meal Tracker</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-gray-800">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-600">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Change Fitness Goals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <CircularProgress
            label="Calories"
            current={totals.calories}
            target={profile.dailyCalorieGoal}
            color={getProgressColor(totals.calories, profile.dailyCalorieGoal)}
          />
          <CircularProgress
            label="Protein"
            current={totals.protein}
            target={profile.dailyProteinGoal}
            color={getProgressColor(totals.protein, profile.dailyProteinGoal)}
            unit="g"
          />
          <CircularProgress
            label="Carbs"
            current={totals.carbs}
            target={profile.dailyCarbsGoal}
            color={getProgressColor(totals.carbs, profile.dailyCarbsGoal)}
            unit="g"
          />
          <CircularProgress
            label="Fat"
            current={totals.fat}
            target={profile.dailyFatGoal}
            color={getProgressColor(totals.fat, profile.dailyFatGoal)}
            unit="g"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => navigate('/log-meal')}
            className="py-6 text-lg font-semibold bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Camera className="w-6 h-6 mr-2" />
            Log Meal
          </Button>
          <Button
            onClick={() => setQuickScanOpen(true)}
            className="py-6 text-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Zap className="w-6 h-6 mr-2" />
            Quick Scan
          </Button>
          <Button
            onClick={() => navigate('/barcode-scan')}
            className="py-6 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Barcode className="w-6 h-6 mr-2" />
            Scan Barcode
          </Button>
        </div>

        <QuickScan open={quickScanOpen} onOpenChange={setQuickScanOpen} />
        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          profile={profile}
          onUpdate={() => setRefreshKey(prev => prev + 1)}
        />

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Today's Meals</h2>
            {meals.length > 0 && (
              <span className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                {meals.length}
              </span>
            )}
          </div>
          {meals.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No meals logged yet</p>
              <p className="text-gray-400 mt-2">Start by logging your first meal!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium min-w-[60px]">
                      {meal.mealType}
                    </span>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex-shrink-0 overflow-hidden">
                    {meal.photoUrl ? (
                      <img src={meal.photoUrl} alt="Meal" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-gray-400 m-auto mt-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 font-medium mb-1">
                      {meal.notes || 'No description'}
                    </div>
                    <div className="font-bold text-gray-900 mb-1">
                      {meal.totalCalories} cal
                    </div>
                    <div className="text-sm text-gray-500">
                      P: {meal.totalProtein}g • C: {meal.totalCarbs}g • F: {meal.totalFat}g
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
