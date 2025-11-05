import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { calculateBMR, calculateTDEE, calculateCalorieGoal, calculateMacros } from '@/lib/calculations';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female',
    height: '',
    weight: '',
    activityLevel: 'moderate',
    goal: 'maintain' as 'lose' | 'maintain' | 'gain',
  });

  const handleComplete = async () => {
    if (!formData.name || !formData.age || !formData.height || !formData.weight) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const age = parseInt(formData.age);
      const height = parseFloat(formData.height);
      const weight = parseFloat(formData.weight);

      const bmr = calculateBMR(weight, height, age, formData.gender);
      const tdee = calculateTDEE(bmr, formData.activityLevel);
      const calorieGoal = calculateCalorieGoal(tdee, formData.goal);
      const macros = calculateMacros(calorieGoal);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('user_profiles').upsert({
        id: user.id,
        name: formData.name,
        age,
        gender: formData.gender,
        height,
        weight,
        activity_level: formData.activityLevel,
        goal: formData.goal,
        daily_calorie_goal: calorieGoal,
        daily_protein_goal: macros.protein,
        daily_carbs_goal: macros.carbs,
        daily_fat_goal: macros.fat,
      });

      if (error) throw error;

      router.replace('/(app)/dashboard');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Basic Information</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        value={formData.age}
        onChangeText={(text) => setFormData({ ...formData, age: text })}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.optionButton, formData.gender === 'male' && styles.optionButtonActive]}
          onPress={() => setFormData({ ...formData, gender: 'male' })}
        >
          <Text style={[styles.optionText, formData.gender === 'male' && styles.optionTextActive]}>
            Male
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, formData.gender === 'female' && styles.optionButtonActive]}
          onPress={() => setFormData({ ...formData, gender: 'female' })}
        >
          <Text style={[styles.optionText, formData.gender === 'female' && styles.optionTextActive]}>
            Female
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Height (cm)"
        value={formData.height}
        onChangeText={(text) => setFormData({ ...formData, height: text })}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Weight (kg)"
        value={formData.weight}
        onChangeText={(text) => setFormData({ ...formData, weight: text })}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Activity & Goals</Text>

      <Text style={styles.label}>Activity Level</Text>
      <View style={styles.optionList}>
        {[
          { value: 'sedentary', label: 'Sedentary (little exercise)' },
          { value: 'light', label: 'Light (1-3 days/week)' },
          { value: 'moderate', label: 'Moderate (3-5 days/week)' },
          { value: 'active', label: 'Active (6-7 days/week)' },
          { value: 'very-active', label: 'Very Active (twice per day)' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              formData.activityLevel === option.value && styles.optionButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, activityLevel: option.value })}
          >
            <Text
              style={[
                styles.optionText,
                formData.activityLevel === option.value && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Goal</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.optionButton, formData.goal === 'lose' && styles.optionButtonActive]}
          onPress={() => setFormData({ ...formData, goal: 'lose' })}
        >
          <Text style={[styles.optionText, formData.goal === 'lose' && styles.optionTextActive]}>
            Lose Weight
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, formData.goal === 'maintain' && styles.optionButtonActive]}
          onPress={() => setFormData({ ...formData, goal: 'maintain' })}
        >
          <Text style={[styles.optionText, formData.goal === 'maintain' && styles.optionTextActive]}>
            Maintain
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, formData.goal === 'gain' && styles.optionButtonActive]}
          onPress={() => setFormData({ ...formData, goal: 'gain' })}
        >
          <Text style={[styles.optionText, formData.goal === 'gain' && styles.optionTextActive]}>
            Gain Weight
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonFlex, loading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Complete</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.flame}>🔥</Text>
          <Text style={styles.logo}>Firehouse Fit</Text>
        </View>

        <View style={styles.progress}>
          <View style={[styles.progressBar, step >= 1 && styles.progressBarActive]} />
          <View style={[styles.progressBar, step >= 2 && styles.progressBarActive]} />
        </View>

        {step === 1 ? renderStep1() : renderStep2()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  flame: {
    fontSize: 32,
    marginRight: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  progress: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: '#dc2626',
  },
  stepContent: {
    gap: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  optionList: {
    gap: 8,
  },
  optionButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  optionButtonActive: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  optionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#dc2626',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonFlex: {
    flex: 2,
    marginTop: 0,
  },
});
