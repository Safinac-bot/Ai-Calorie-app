import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { supabase } from '../../lib/supabase';

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

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function BarcodeScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [servings, setServings] = useState(1);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanning(false);
    await lookupBarcode(data);
  };

  const lookupBarcode = async (barcodeNumber: string) => {
    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const apiUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/barcode-lookup`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
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
      setError('Product not found. Please try scanning again.');
      setTimeout(() => setScanning(true), 2000);
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
        router.replace('/auth');
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

      router.replace('/dashboard');
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

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera permission is required to scan barcodes</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (scanning) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Scan Barcode</Text>
        </View>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanText}>Position barcode inside frame</Text>
        </View>
      </View>
    );
  }

  if (loading && !product) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Looking up product...</Text>
      </View>
    );
  }

  if (product) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Product Found</Text>
        </View>

        <View style={styles.productCard}>
          <View style={styles.productHeader}>
            {product.imageUrl && (
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.productImage}
              />
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              {product.brand && (
                <Text style={styles.productBrand}>{product.brand}</Text>
              )}
              <Text style={styles.servingSize}>Serving: {product.servingSize}</Text>
            </View>
          </View>

          <View style={styles.macroGrid}>
            <View style={[styles.macroCard, styles.calorieCard]}>
              <Text style={styles.macroValue}>
                {Math.round(product.calories * servings)}
              </Text>
              <Text style={styles.macroLabel}>Calories</Text>
            </View>
            <View style={[styles.macroCard, styles.proteinCard]}>
              <Text style={styles.macroValue}>
                {Math.round(product.protein * servings)}g
              </Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={[styles.macroCard, styles.carbsCard]}>
              <Text style={styles.macroValue}>
                {Math.round(product.carbs * servings)}g
              </Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={[styles.macroCard, styles.fatCard]}>
              <Text style={styles.macroValue}>
                {Math.round(product.fat * servings)}g
              </Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>

          <View style={styles.servingsSection}>
            <Text style={styles.sectionTitle}>Number of Servings</Text>
            <View style={styles.servingsControl}>
              <TouchableOpacity
                style={styles.servingButton}
                onPress={() => setServings(Math.max(0.5, servings - 0.5))}
              >
                <Text style={styles.servingButtonText}>-</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.servingsInput}
                value={servings.toString()}
                onChangeText={(text) => setServings(Math.max(0.5, parseFloat(text) || 1))}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={styles.servingButton}
                onPress={() => setServings(servings + 0.5)}
              >
                <Text style={styles.servingButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mealTypeSection}>
            <Text style={styles.sectionTitle}>Select Meal Type</Text>
            <View style={styles.mealTypeGrid}>
              {mealTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.mealTypeButton,
                    mealType === option.value && styles.mealTypeButtonActive,
                  ]}
                  onPress={() => setMealType(option.value)}
                >
                  <Text style={styles.mealTypeEmoji}>{option.emoji}</Text>
                  <Text style={styles.mealTypeLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, (!mealType || loading) && styles.saveButtonDisabled]}
              onPress={saveMeal}
              disabled={!mealType || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save to Diary</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => {
                setProduct(null);
                setMealType(null);
                setServings(1);
                setScanning(true);
              }}
            >
              <Text style={styles.scanAgainButtonText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  scanOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 4,
    borderColor: '#10b981',
    borderRadius: 20,
  },
  scanText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 30,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  productCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  productBrand: {
    fontSize: 14,
    color: '#10b981',
    marginBottom: 5,
  },
  servingSize: {
    fontSize: 14,
    color: '#6b7280',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  macroCard: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  calorieCard: {
    backgroundColor: '#d1fae5',
  },
  proteinCard: {
    backgroundColor: '#fee2e2',
  },
  carbsCard: {
    backgroundColor: '#fef3c7',
  },
  fatCard: {
    backgroundColor: '#dbeafe',
  },
  macroValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  macroLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  servingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  servingButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  servingsInput: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  mealTypeSection: {
    marginBottom: 20,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  mealTypeButtonActive: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  mealTypeEmoji: {
    fontSize: 28,
    marginBottom: 5,
  },
  mealTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#10b981',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanAgainButton: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
  },
  scanAgainButtonText: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
