import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Pricing() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Start free, upgrade when you're ready</Text>

        <View style={styles.plans}>
          <View style={styles.plan}>
            <Text style={styles.planName}>Free</Text>
            <Text style={styles.planPrice}>
              $0<Text style={styles.planPeriod}>/month</Text>
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>✓ 3 meal scans per day</Text>
              <Text style={styles.feature}>✓ Basic nutritional tracking</Text>
              <Text style={styles.feature}>✓ Daily progress reports</Text>
            </View>
            <TouchableOpacity
              style={styles.planButton}
              onPress={() => router.push('/(auth)/auth')}
            >
              <Text style={styles.planButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.plan, styles.planPremium]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>MOST POPULAR</Text>
            </View>
            <Text style={styles.planName}>Pro</Text>
            <Text style={styles.planPrice}>
              $9.99<Text style={styles.planPeriod}>/month</Text>
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>✓ Unlimited meal scans</Text>
              <Text style={styles.feature}>✓ Advanced analytics</Text>
              <Text style={styles.feature}>✓ Custom meal plans</Text>
              <Text style={styles.feature}>✓ Priority support</Text>
              <Text style={styles.feature}>✓ Export your data</Text>
            </View>
            <TouchableOpacity
              style={[styles.planButton, styles.planButtonPremium]}
              onPress={() => router.push('/(auth)/auth')}
            >
              <Text style={styles.planButtonTextPremium}>Upgrade to Pro</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.plan}>
            <Text style={styles.planName}>Team</Text>
            <Text style={styles.planPrice}>
              $24.99<Text style={styles.planPeriod}>/month</Text>
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>✓ Everything in Pro</Text>
              <Text style={styles.feature}>✓ Up to 5 team members</Text>
              <Text style={styles.feature}>✓ Team analytics dashboard</Text>
              <Text style={styles.feature}>✓ Shared meal plans</Text>
            </View>
            <TouchableOpacity
              style={styles.planButton}
              onPress={() => router.push('/(auth)/auth')}
            >
              <Text style={styles.planButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
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
  backButton: {
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  plans: {
    gap: 16,
  },
  plan: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 24,
    backgroundColor: '#fff',
  },
  planPremium: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  badge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111',
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 16,
  },
  planPeriod: {
    fontSize: 18,
    color: '#666',
  },
  features: {
    gap: 12,
    marginBottom: 24,
  },
  feature: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  planButton: {
    borderWidth: 2,
    borderColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  planButtonPremium: {
    backgroundColor: '#dc2626',
  },
  planButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  planButtonTextPremium: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
