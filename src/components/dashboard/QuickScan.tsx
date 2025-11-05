import { useState } from 'react';
import { Camera, X, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { analyzeFoodImage } from '@/utils/foodRecognition';

interface QuickScanProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickScan = ({ open, onOpenChange }: QuickScanProps) => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    foods: Array<{ name: string; portion: string; calories: number; protein: number; carbs: number; fat: number }>;
    totals: { calories: number; protein: number; carbs: number; fat: number };
  } | null>(null);

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

  const handleAnalyze = async () => {
    if (!photoFile) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setResults(null);

    try {
      const detectedFoods = await analyzeFoodImage(photoFile);

      const totals = detectedFoods.reduce(
        (acc, food) => ({
          calories: acc.calories + food.calories,
          protein: acc.protein + food.protein,
          carbs: acc.carbs + food.carbs,
          fat: acc.fat + food.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      setResults({ foods: detectedFoods, totals });
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setPhotoFile(null);
    setPhotoUrl(null);
    setResults(null);
    setAnalysisError(null);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Zap className="w-6 h-6 text-yellow-500" />
            Quick Nutrition Scan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                id="quick-scan-upload"
              />
              <label htmlFor="quick-scan-upload" className="cursor-pointer">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-yellow-600" />
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Take or Upload Photo
                </p>
                <p className="text-sm text-gray-500">
                  Get instant nutrition info without logging
                </p>
              </label>
            </div>
          ) : (
            <>
              <div className="relative rounded-xl overflow-hidden">
                <img src={photoUrl} alt="Food scan" className="w-full rounded-xl max-h-96 object-cover" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {!isAnalyzing && !results && (
                <Button
                  onClick={handleAnalyze}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Now
                </Button>
              )}
            </>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Analyzing nutrition...</p>
            </div>
          )}

          {analysisError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{analysisError}</p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Total Nutrition</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{results.totals.calories}</div>
                    <div className="text-xs opacity-90">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{results.totals.protein}g</div>
                    <div className="text-xs opacity-90">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{results.totals.carbs}g</div>
                    <div className="text-xs opacity-90">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{results.totals.fat}g</div>
                    <div className="text-xs opacity-90">Fat</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Detected Foods:</h4>
                {results.foods.map((food, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-800">{food.name}</h5>
                        <p className="text-sm text-gray-600">{food.portion}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm mt-2">
                      <div className="text-center">
                        <div className="font-bold text-emerald-600">{food.calories}</div>
                        <div className="text-xs text-gray-500">cal</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-red-500">{food.protein}g</div>
                        <div className="text-xs text-gray-500">P</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-yellow-600">{food.carbs}g</div>
                        <div className="text-xs text-gray-500">C</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-500">{food.fat}g</div>
                        <div className="text-xs text-gray-500">F</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Scan Another
                </Button>
                <Button onClick={handleClose} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
