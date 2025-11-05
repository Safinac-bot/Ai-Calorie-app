import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface UserStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalMeals: number;
}

export default function Admin() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    totalMeals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = format(today, 'yyyy-MM-dd');

      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = format(weekAgo, 'yyyy-MM-dd');

      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthAgoStr = format(monthAgo, 'yyyy-MM-dd');

      const { data: allUsers } = await supabase.from('user_profiles').select('id, created_at');

      const totalUsers = allUsers?.length || 0;
      const newUsersToday = allUsers?.filter((u) => u.created_at >= todayStr).length || 0;
      const newUsersThisWeek = allUsers?.filter((u) => u.created_at >= weekAgoStr).length || 0;
      const newUsersThisMonth = allUsers?.filter((u) => u.created_at >= monthAgoStr).length || 0;

      const { count: totalMeals } = await supabase
        .from('meals')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        totalMeals: totalMeals || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.flame}>🔥</Text>
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Admin Stats</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{stats.totalUsers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>

          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>{stats.newUsersToday.toLocaleString()}</Text>
            <Text style={styles.statLabel}>New Today</Text>
          </View>

          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statValue}>{stats.newUsersThisWeek.toLocaleString()}</Text>
            <Text style={styles.statLabel}>New This Week</Text>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{stats.newUsersThisMonth.toLocaleString()}</Text>
            <Text style={styles.statLabel}>New This Month</Text>
          </View>

          <View style={[styles.statCard, styles.statCardPurple]}>
            <Text style={styles.statIcon}>🍽️</Text>
            <Text style={styles.statValue}>{stats.totalMeals.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Meals</Text>
          </View>

          <View style={[styles.statCard, styles.statCardTeal]}>
            <Text style={styles.statIcon}>📉</Text>
            <Text style={styles.statValue}>
              {stats.totalUsers > 0 ? (stats.totalMeals / stats.totalUsers).toFixed(1) : '0'}
            </Text>
            <Text style={styles.statLabel}>Avg per User</Text>
          </View>
        </View>

        <View style={styles.growthCard}>
          <Text style={styles.growthTitle}>Growth Rates</Text>

          <View style={styles.growthItem}>
            <Text style={styles.growthLabel}>Daily Growth</Text>
            <Text style={styles.growthValue}>
              {stats.totalUsers > 0
                ? ((stats.newUsersToday / stats.totalUsers) * 100).toFixed(2)
                : '0'}
              %
            </Text>
          </View>

          <View style={styles.growthItem}>
            <Text style={styles.growthLabel}>Weekly Growth</Text>
            <Text style={styles.growthValue}>
              {stats.totalUsers > 0
                ? ((stats.newUsersThisWeek / stats.totalUsers) * 100).toFixed(2)
                : '0'}
              %
            </Text>
          </View>

          <View style={styles.growthItem}>
            <Text style={styles.growthLabel}>Monthly Growth</Text>
            <Text style={styles.growthValue}>
              {stats.totalUsers > 0
                ? ((stats.newUsersThisMonth / stats.totalUsers) * 100).toFixed(2)
                : '0'}
              %
            </Text>
          </View>
        </View>
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
  backButton: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  statCardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  statCardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  statCardOrange: {
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  statCardPurple: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  statCardTeal: {
    borderLeftWidth: 4,
    borderLeftColor: '#14b8a6',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  growthCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  growthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111',
  },
  growthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  growthLabel: {
    fontSize: 16,
    color: '#374151',
  },
  growthValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
});
