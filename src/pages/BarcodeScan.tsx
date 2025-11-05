import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { MealType } from '@/types';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface ProductInfo {
  name: string;
  brand: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl: string;
}

export const BarcodeScan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [servings, setServings] = useState(1);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    setScanning(true);
    setError(null);

    try {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await codeReader.listVideoInputDevices();

      const backCamera = videoInputDevices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear')
      ) || videoInputDevices[videoInputDevices.length - 1];

      if (videoRef.current) {
        codeReader.decodeFromVideoDevice(
          backCamera?.deviceId,
          videoRef.current,
          async (result, error) => {
            if (result) {
              const barcode = result.getText();
              console.log('Scanned barcode:', barcode);
              stopScanning();
              await lookupBarcode(barcode);
            }
            if (error && !(error instanceof NotFoundException)) {
              console.error('Scanner error:', error);
            }
          }
        );
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please check permissions and try again.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
  };

  const lookupBarcode = async (barcodeNumber: string) => {
    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/barcode-lookup`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode: barcodeNumber }),
      });

      if (!response.ok) {
        throw new Error('Product not found');
      }

      const productData = await response.json();
      setProduct(productData);
    } catch (err) {
      setError('Product not found. Please try scanning again or check the barcode.');
      setTimeout(() => {
        setScanning(true);
        startScanning();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const saveMeal = async () => {
    if (!product || !mealType) {
      setError('Please select a meal type');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const totalCalories = product.calories * servings;
      const totalProtein = product.protein * servings;
      const totalCarbs = product.carbs * servings;
      const totalFat = product.fat * servings;

      const mealData = {
        user_id: user.id,
        meal_date: new Date().toISOString().split('T')[0],
        meal_type: mealType,
        photo_url: product.imageUrl || null,
        notes: `${product.brand ? product.brand + ' - ' : ''}${product.name}`,
      };

      const { data: insertedMeal, error: insertError } = await supabase
        .from('meals')
        .insert(mealData)
        .select()
        .single();

      if (insertError) throw insertError;
      if (!insertedMeal) throw new Error('No meal data returned');

      const mealItem = {
        meal_id: insertedMeal.id,
        food_name: `${product.brand ? product.brand + ' - ' : ''}${product.name}`,
        serving_size: `${servings} x ${product.servingSize}`,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      };

      const { error: itemError } = await supabase
        .from('meal_items')
        .insert([mealItem]);

      if (itemError) throw itemError;

      navigate('/dashboard', { state: { refresh: true } });
    } catch (err) {
      setError('Failed to save meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const mealTypeOptions = [
    { value: 'breakfast' as MealType, label: 'Breakfast', emoji: '🌅' },
    { value: 'lunch' as MealType, label: 'Lunch', emoji: '☀️' },
    { value: 'dinner' as MealType, label: 'Dinner', emoji: '🌙' },
    { value: 'snack' as MealType, label: 'Snack', emoji: '🍪' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Scan Barcode</h1>
            <p className="text-gray-600 mt-1">Point camera at barcode for instant detection</p>
          </div>
        </div>

        {!product && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {!scanning && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Ready to Scan</h2>
                    <p className="text-sm text-gray-600">Fast and accurate barcode detection</p>
                  </div>
                </div>

                <Button
                  onClick={startScanning}
                  className="w-full py-8 text-xl font-semibold bg-emerald-600 hover:bg-emerald-700"
                >
                  <Camera className="w-8 h-8 mr-3" />
                  Start Camera
                </Button>
              </div>
            )}

            {scanning && (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-[500px] object-cover"
                  autoPlay
                  playsInline
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="border-4 border-emerald-500 rounded-2xl w-64 h-64 bg-transparent shadow-2xl">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                  </div>
                  <div className="mt-8 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full">
                    <p className="text-white text-lg font-semibold">Position barcode in frame</p>
                  </div>
                </div>
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm"
                >
                  Stop Scanning
                </Button>
              </div>
            )}

            {error && !product && (
              <div className="p-4 mx-4 mb-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {loading && !product && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700">Looking up product...</p>
          </div>
        )}

        {product && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <div className="flex items-start gap-6 mb-6">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{product.name}</h3>
                  {product.brand && (
                    <Badge variant="outline" className="mb-3">
                      {product.brand}
                    </Badge>
                  )}
                  <p className="text-gray-600">Serving: {product.servingSize}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600">
                    {Math.round(product.calories * servings)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Calories</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <div className="text-2xl font-bold text-red-600">
                    {Math.round(product.protein * servings)}g
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Protein</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round(product.carbs * servings)}g
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Carbs</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(product.fat * servings)}g
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Fat</div>
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="servings">Number of Servings</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                    className="w-10 h-10"
                  >
                    -
                  </Button>
                  <Input
                    id="servings"
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(Math.max(0.5, parseFloat(e.target.value) || 1))}
                    step="0.5"
                    min="0.5"
                    className="w-24 text-center text-lg font-semibold"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setServings(servings + 0.5)}
                    className="w-10 h-10"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Select Meal Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {mealTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setMealType(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        mealType === option.value
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.emoji}</div>
                      <div className="font-semibold text-gray-800">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={saveMeal}
                disabled={loading || !mealType}
                className="flex-1 py-6 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save to Diary'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setProduct(null);
                  setMealType(null);
                  setServings(1);
                  setError(null);
                }}
                className="py-6 text-lg font-semibold"
              >
                Scan Another
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
