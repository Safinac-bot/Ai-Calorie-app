import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Landing() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.flame}>🔥</Text>
          <Text style={styles.logo}>Firehouse Fit</Text>
        </View>

        <Text style={styles.headline}>
          Track Your Nutrition{'\n'}Like a Pro Firefighter
        </Text>

        <Text style={styles.subheadline}>
          Snap a photo of your meal and instantly get detailed nutritional information. Stay fit, stay ready.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📸</Text>
            <Text style={styles.featureTitle}>Instant Meal Scanning</Text>
            <Text style={styles.featureText}>Take a photo and get complete nutritional breakdown</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Track Your Progress</Text>
            <Text style={styles.featureText}>Monitor calories, protein, carbs, and fats daily</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureTitle}>Personalized Goals</Text>
            <Text style={styles.featureText}>Custom nutrition plans based on your needs</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/auth')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/pricing')}
          >
            <Text style={styles.secondaryButtonText}>View Pricing</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 40,
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
  headline: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111',
  },
  subheadline: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  features: {
    marginBottom: 40,
  },
  feature: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttons: {
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
});
