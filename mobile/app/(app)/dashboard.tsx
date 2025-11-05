import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  name: string;
  daily_calorie_goal: number;
  daily_protein_goal: number;
  daily_carbs_goal: number;
  daily_fat_goal: number;
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [totals, setTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/landing');
        return;
      }

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profileData) {
        router.replace('/(app)/onboarding');
        return;
      }

      setProfile(profileData);

      const today = new Date().toISOString().split('T')[0];
      const { data: meals } = await supabase
        .from('meals')
        .select('total_calories, total_protein, total_carbs, total_fat')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .lt('created_at', `${today}T23:59:59`);

      if (meals) {
        const dailyTotals = meals.reduce(
          (acc, meal) => ({
            calories: acc.calories + (meal.total_calories || 0),
            protein: acc.protein + (meal.total_protein || 0),
            carbs: acc.carbs + (meal.total_carbs || 0),
            fat: acc.fat + (meal.total_fat || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
        setTotals(dailyTotals);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/landing');
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.flame}>🔥</Text>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!profile) return null;

  const caloriePercentage = (totals.calories / profile.daily_calorie_goal) * 100;
  const proteinPercentage = (totals.protein / profile.daily_protein_goal) * 100;
  const carbsPercentage = (totals.carbs / profile.daily_carbs_goal) * 100;
  const fatPercentage = (totals.fat / profile.daily_fat_goal) * 100;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {profile.name}</Text>
            <Text style={styles.subGreeting}>Track your nutrition today</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calorieCard}>
          <View style={styles.circularProgress}>
            <Text style={styles.calorieNumber}>{Math.round(totals.calories)}</Text>
            <Text style={styles.calorieLabel}>/ {profile.daily_calorie_goal}</Text>
            <Text style={styles.calorieUnit}>calories</Text>
          </View>
          <Text style={styles.calorieRemaining}>
            {profile.daily_calorie_goal - totals.calories > 0
              ? `${Math.round(profile.daily_calorie_goal - totals.calories)} remaining`
              : 'Goal reached!'}
          </Text>
        </View>

        <View style={styles.macrosCard}>
          <Text style={styles.macrosTitle}>Today's Macros</Text>

          <View style={styles.macro}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroName}>Protein</Text>
              <Text style={styles.macroValue}>
                {Math.round(totals.protein)}g / {profile.daily_protein_goal}g
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${Math.min(proteinPercentage, 100)}%`, backgroundColor: '#3b82f6' }]}
              />
            </View>
          </View>

          <View style={styles.macro}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroName}>Carbs</Text>
              <Text style={styles.macroValue}>
                {Math.round(totals.carbs)}g / {profile.daily_carbs_goal}g
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${Math.min(carbsPercentage, 100)}%`, backgroundColor: '#10b981' }]}
              />
            </View>
          </View>

          <View style={styles.macro}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroName}>Fat</Text>
              <Text style={styles.macroValue}>
                {Math.round(totals.fat)}g / {profile.daily_fat_goal}g
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${Math.min(fatPercentage, 100)}%`, backgroundColor: '#f59e0b' }]}
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push('/(app)/log-meal')}
          >
            <Text style={styles.scanButtonText}>📸 Log Meal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.barcodeButton}
            onPress={() => router.push('/(app)/barcode-scan')}
          >
            <Text style={styles.barcodeButtonText}>📷 Scan Barcode</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => router.push('/(app)/admin')}
        >
          <Text style={styles.adminButtonText}>View Admin Stats</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  flame: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  calorieCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  circularProgress: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  calorieLabel: {
    fontSize: 16,
    color: '#666',
  },
  calorieUnit: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  calorieRemaining: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  macrosCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  macrosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111',
  },
  macro: {
    marginBottom: 16,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  macroName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  macroValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  barcodeButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  barcodeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adminButton: {
    borderWidth: 2,
    borderColor: '#dc2626',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});
