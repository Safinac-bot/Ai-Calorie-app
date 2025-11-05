import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Plus, Trash2, Save, Cookie, Loader2, MinusCircle, PlusCircle, Sunrise, Sun, Sunset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { MealType } from '@/types';
import { analyzeFoodImage } from '@/utils/foodRecognition';
import { useToast } from '@/hooks/use-toast';

interface DetectedFoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  adjustmentFactor: number;
}

type ScreenState = 'photo' | 'mealType' | 'analyzing' | 'review';

export const LogMeal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [screenState, setScreenState] = useState<ScreenState>('photo');
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [detectedFoods, setDetectedFoods] = useState<DetectedFoodItem[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newServingSize, setNewServingSize] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [newProtein, setNewProtein] = useState('');
  const [newCarbs, setNewCarbs] = useState('');
  const [newFat, setNewFat] = useState('');
  const [analysisStage, setAnalysisStage] = useState('');

  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setAnalysisError('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAnalysisError('Image must be under 10MB');
      return;
    }

    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  };

  const handleRetakePhoto = () => {
    setPhotoFile(null);
    setPhotoUrl(null);
    setDetectedFoods([]);
    setAnalysisError(null);
    setScreenState('photo');
    setMealType(null);
  };

  const handleAnalyzeMeal = async () => {
    if (!photoFile) return;

    if (!mealType) {
      setScreenState('mealType');
      return;
    }

    setScreenState('analyzing');
    setAnalysisError(null);

    setAnalysisStage('Analyzing your meal...');

    setTimeout(() => {
      setAnalysisStage('Identifying foods...');
    }, 1000);

    setTimeout(() => {
      setAnalysisStage('Calculating nutrition...');
    }, 2000);

    try {
      const detectedFoods = await analyzeFoodImage(photoFile);

      const foods: DetectedFoodItem[] = detectedFoods.map(food => ({
        id: crypto.randomUUID(),
        name: food.name,
        portion: food.portion,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        confidence: food.confidence,
        adjustmentFactor: 1.0
      }));

      setDetectedFoods(foods);
      setScreenState('review');
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze image');
      setScreenState('review');
    } finally {
      setAnalysisStage('');
    }
  };

  const adjustPortion = (id: string, delta: number) => {
    setDetectedFoods(prev =>
      prev.map(food =>
        food.id === id
          ? { ...food, adjustmentFactor: Math.max(0.25, Math.min(2, food.adjustmentFactor + delta)) }
          : food
      )
    );
  };

  const removeFood = (id: string) => {
    setDetectedFoods(prev => prev.filter(food => food.id !== id));
  };

  const addManualFood = () => {
    if (!newFoodName || !newServingSize || !newCalories) {
      alert('Please fill in at least food name, serving size, and calories');
      return;
    }

    const newFood: DetectedFoodItem = {
      id: crypto.randomUUID(),
      name: newFoodName,
      portion: newServingSize,
      calories: parseInt(newCalories) || 0,
      protein: parseInt(newProtein) || 0,
      carbs: parseInt(newCarbs) || 0,
      fat: parseInt(newFat) || 0,
      confidence: 1,
      adjustmentFactor: 1.0
    };

    setDetectedFoods([...detectedFoods, newFood]);
    setNewFoodName('');
    setNewServingSize('');
    setNewCalories('');
    setNewProtein('');
    setNewCarbs('');
    setNewFat('');
    setShowManualEntry(false);
  };

  const calculateTotals = () => {
    return detectedFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + Math.round(food.calories * food.adjustmentFactor),
        protein: acc.protein + Math.round(food.protein * food.adjustmentFactor),
        carbs: acc.carbs + Math.round(food.carbs * food.adjustmentFactor),
        fat: acc.fat + Math.round(food.fat * food.adjustmentFactor),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleSaveMeal = async () => {
    if (detectedFoods.length === 0 || !mealType) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Saving meal for user:', user?.id);

      if (!user) {
        console.error('No user found when trying to save meal');
        navigate('/auth');
        return;
      }

      let photoStorageUrl = null;
      if (photoFile) {
        const fileName = `${user.id}/${Date.now()}.jpg`;
        console.log('Uploading photo:', fileName);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('meals')
          .upload(fileName, photoFile);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('meals')
            .getPublicUrl(uploadData.path);
          photoStorageUrl = urlData.publicUrl;
          console.log('Photo uploaded successfully:', photoStorageUrl);
        }
      }

      const totals = calculateTotals();

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const mealDate = `${year}-${month}-${day}`;

      const mealData = {
        user_id: user.id,
        meal_date: mealDate,
        meal_type: mealType,
        photo_url: photoStorageUrl,
        notes: detectedFoods.map(f => f.name).join(', '),
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fat: totals.fat,
      };

      console.log('Inserting meal:', mealData);

      const { data: insertedMeal, error: insertError } = await supabase
        .from('meals')
        .insert(mealData)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting meal:', insertError);
        throw insertError;
      }

      if (!insertedMeal) {
        throw new Error('No meal data returned');
      }

      console.log('Meal inserted successfully:', insertedMeal.id);

      const mealItems = detectedFoods.map((food) => ({
        meal_id: insertedMeal.id,
        food_name: food.name,
        serving_size: food.portion,
        calories: Math.round(food.calories * food.adjustmentFactor),
        protein: Math.round(food.protein * food.adjustmentFactor),
        carbs: Math.round(food.carbs * food.adjustmentFactor),
        fat: Math.round(food.fat * food.adjustmentFactor),
      }));

      console.log('Inserting meal items:', mealItems);

      const { error: itemsError } = await supabase
        .from('meal_items')
        .insert(mealItems);

      if (itemsError) {
        console.error('Error inserting meal items:', itemsError);
        throw itemsError;
      }

      console.log('Meal items inserted successfully, navigating to dashboard');

      toast({
        title: 'Meal saved!',
        description: `${detectedFoods.length} food items logged successfully`,
      });

      setTimeout(() => {
        navigate('/dashboard', { state: { refresh: true }, replace: true });
      }, 500);
    } catch (error) {
      console.error('Error saving meal:', error);
      toast({
        title: 'Error saving meal',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  const mealTypeOptions = [
    { value: 'breakfast' as MealType, label: 'Breakfast', icon: Sunrise },
    { value: 'lunch' as MealType, label: 'Lunch', icon: Sun },
    { value: 'dinner' as MealType, label: 'Dinner', icon: Sunset },
    { value: 'snack' as MealType, label: 'Snack', icon: Cookie },
  ];

  if (screenState === 'photo') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Log Your Meal</h1>
              <p className="text-gray-600 mt-1">Take or upload a photo</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {!photoUrl ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-10 h-10 text-emerald-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Take or Upload Photo
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-xl overflow-hidden">
                  <img src={photoUrl} alt="Meal preview" className="w-full rounded-xl" />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleRetakePhoto} className="flex-1">
                    Retake
                  </Button>
                  <Button onClick={handleAnalyzeMeal} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    Analyze Meal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screenState === 'mealType') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => setScreenState('photo')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Select Meal Type</h1>
              <p className="text-gray-600 mt-1">What meal is this?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {mealTypeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setMealType(option.value);
                    handleAnalyzeMeal();
                  }}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-emerald-500"
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{option.label}</h3>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (screenState === 'analyzing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{analysisStage}</h2>
          <p className="text-gray-600">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={handleRetakePhoto}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Review & Save</h1>
            <p className="text-gray-600 mt-1">Adjust portions if needed</p>
          </div>
        </div>

        {photoUrl && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <img src={photoUrl} alt="Meal" className="w-full rounded-xl max-h-64 object-cover" />
          </div>
        )}

        {analysisError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{analysisError}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {detectedFoods.map((food) => {
            const adjustedCalories = Math.round(food.calories * food.adjustmentFactor);
            const adjustedProtein = Math.round(food.protein * food.adjustmentFactor);
            const adjustedCarbs = Math.round(food.carbs * food.adjustmentFactor);
            const adjustedFat = Math.round(food.fat * food.adjustmentFactor);

            return (
              <div key={food.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{food.name}</h3>
                    <p className="text-sm text-gray-600">{food.portion}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {food.confidence < 0.85 && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(food.confidence * 100)}% confident
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFood(food.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-600">{adjustedCalories}</div>
                    <div className="text-xs text-gray-500">Cal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-500">{adjustedProtein}g</div>
                    <div className="text-xs text-gray-500">P</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-600">{adjustedCarbs}g</div>
                    <div className="text-xs text-gray-500">C</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-500">{adjustedFat}g</div>
                    <div className="text-xs text-gray-500">F</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustPortion(food.id, -0.25)}
                    disabled={food.adjustmentFactor <= 0.25}
                  >
                    <MinusCircle className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[60px] text-center">
                    {Math.round(food.adjustmentFactor * 100)}%
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustPortion(food.id, 0.25)}
                    disabled={food.adjustmentFactor >= 2}
                  >
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {!showManualEntry ? (
          <Button
            variant="outline"
            onClick={() => setShowManualEntry(true)}
            className="w-full mb-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Food Manually
          </Button>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Food Manually</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <Label htmlFor="foodName">Food Name</Label>
                <Input
                  id="foodName"
                  value={newFoodName}
                  onChange={(e) => setNewFoodName(e.target.value)}
                  placeholder="e.g., Grilled Chicken"
                />
              </div>
              <div>
                <Label htmlFor="servingSize">Serving Size</Label>
                <Input
                  id="servingSize"
                  value={newServingSize}
                  onChange={(e) => setNewServingSize(e.target.value)}
                  placeholder="e.g., 6 oz"
                />
              </div>
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={newCalories}
                  onChange={(e) => setNewCalories(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  value={newProtein}
                  onChange={(e) => setNewProtein(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={newCarbs}
                  onChange={(e) => setNewCarbs(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  value={newFat}
                  onChange={(e) => setNewFat(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowManualEntry(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={addManualFood} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                Add Food
              </Button>
            </div>
          </div>
        )}

        {detectedFoods.length > 0 && (
          <>
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Total Nutrition</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{totals.calories}</div>
                  <div className="text-xs text-emerald-100">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{totals.protein}g</div>
                  <div className="text-xs text-emerald-100">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{totals.carbs}g</div>
                  <div className="text-xs text-emerald-100">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{totals.fat}g</div>
                  <div className="text-xs text-emerald-100">Fat</div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveMeal}
              disabled={loading}
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Saving...' : 'Save Meal'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
