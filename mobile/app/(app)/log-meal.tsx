import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { analyzeFoodImage, FoodItem } from '@/lib/foodRecognition';

export default function LogMeal() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to scan meals.');
      return false;
    }
    return true;
  };

  const takePicture = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setImage(result.assets[0].uri);
        await analyzeMeal(result.assets[0].base64);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setImage(result.assets[0].uri);
        await analyzeMeal(result.assets[0].base64);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const analyzeMeal = async (base64Image: string) => {
    setAnalyzing(true);
    try {
      const items = await analyzeFoodImage(base64Image);
      setFoodItems(items);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to analyze meal. Please try again.');
      setImage(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    if (foodItems.length === 0) {
      Alert.alert('Error', 'No food items to save');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const mealData = {
        user_id: user.id,
        meal_date: new Date().toISOString().split('T')[0],
        meal_type: 'snack',
        photo_url: null,
        notes: foodItems.map(f => f.name).join(', '),
      };

      const { data: meal, error: mealError } = await supabase
        .from('meals')
        .insert(mealData)
        .select()
        .single();

      if (mealError) throw mealError;
      if (!meal) throw new Error('No meal data returned');

      const mealItems = foodItems.map((item) => ({
        meal_id: meal.id,
        food_name: item.name,
        serving_size: item.portion,
        calories: Math.round(item.calories),
        protein: Math.round(item.protein),
        carbs: Math.round(item.carbs),
        fat: Math.round(item.fat),
      }));

      const { error: itemsError } = await supabase.from('meal_items').insert(mealItems);

      if (itemsError) throw itemsError;

      Alert.alert('Success', 'Meal logged successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Log Meal</Text>
          <View style={{ width: 60 }} />
        </View>

        {!image ? (
          <View style={styles.uploadSection}>
            <Text style={styles.uploadIcon}>📸</Text>
            <Text style={styles.uploadTitle}>Capture Your Meal</Text>
            <Text style={styles.uploadText}>
              Take a photo or select from your library to analyze nutritional content
            </Text>

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.primaryButton} onPress={takePicture}>
                <Text style={styles.primaryButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
                <Text style={styles.secondaryButtonText}>Choose from Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : analyzing ? (
          <View style={styles.analyzingSection}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.analyzingText}>Analyzing your meal...</Text>
            <Text style={styles.analyzingSubtext}>This may take a few seconds</Text>
          </View>
        ) : (
          <View style={styles.resultsSection}>
            <Image source={{ uri: image }} style={styles.mealImage} />

            <View style={styles.resultsCard}>
              <Text style={styles.resultsTitle}>Nutritional Information</Text>

              {foodItems.map((item, index) => (
                <View key={index} style={styles.foodItem}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodQuantity}>{item.portion}</Text>
                  <View style={styles.foodNutrition}>
                    <View style={styles.nutrient}>
                      <Text style={styles.nutrientValue}>{Math.round(item.calories)}</Text>
                      <Text style={styles.nutrientLabel}>cal</Text>
                    </View>
                    <View style={styles.nutrient}>
                      <Text style={styles.nutrientValue}>{Math.round(item.protein)}g</Text>
                      <Text style={styles.nutrientLabel}>protein</Text>
                    </View>
                    <View style={styles.nutrient}>
                      <Text style={styles.nutrientValue}>{Math.round(item.carbs)}g</Text>
                      <Text style={styles.nutrientLabel}>carbs</Text>
                    </View>
                    <View style={styles.nutrient}>
                      <Text style={styles.nutrientValue}>{Math.round(item.fat)}g</Text>
                      <Text style={styles.nutrientLabel}>fat</Text>
                    </View>
                  </View>
                </View>
              ))}

              <View style={styles.totalSection}>
                <Text style={styles.totalTitle}>Total</Text>
                <View style={styles.totalNutrition}>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalValue}>
                      {Math.round(foodItems.reduce((sum, item) => sum + item.calories, 0))}
                    </Text>
                    <Text style={styles.totalLabel}>calories</Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalValue}>
                      {Math.round(foodItems.reduce((sum, item) => sum + item.protein, 0))}g
                    </Text>
                    <Text style={styles.totalLabel}>protein</Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalValue}>
                      {Math.round(foodItems.reduce((sum, item) => sum + item.carbs, 0))}g
                    </Text>
                    <Text style={styles.totalLabel}>carbs</Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalValue}>
                      {Math.round(foodItems.reduce((sum, item) => sum + item.fat, 0))}g
                    </Text>
                    <Text style={styles.totalLabel}>fat</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={saveMeal}>
                <Text style={styles.saveButtonText}>Save Meal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => {
                  setImage(null);
                  setFoodItems([]);
                }}
              >
                <Text style={styles.retakeButtonText}>Take Another Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  uploadSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  uploadIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111',
  },
  uploadText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzingSection: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  analyzingText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    color: '#111',
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  resultsSection: {
    gap: 16,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111',
  },
  foodItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111',
  },
  foodQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  foodNutrition: {
    flexDirection: 'row',
    gap: 16,
  },
  nutrient: {
    alignItems: 'center',
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  nutrientLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#dc2626',
  },
  totalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111',
  },
  totalNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retakeButton: {
    borderWidth: 2,
    borderColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});
