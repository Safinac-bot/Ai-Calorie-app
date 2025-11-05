import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Users, TrendingUp, Calendar, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface UserStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  totalMeals: number;
  totalScans: number;
}

export const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    totalMeals: 0,
    totalScans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate('/');
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = format(today, 'yyyy-MM-dd');

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = format(weekAgo, 'yyyy-MM-dd');

        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const monthAgoStr = format(monthAgo, 'yyyy-MM-dd');

        const { data: allUsers, error: allUsersError } = await supabase
          .from('user_profiles')
          .select('id, created_at');

        if (allUsersError) throw allUsersError;

        const totalUsers = allUsers?.length || 0;
        const newUsersToday = allUsers?.filter(u => u.created_at >= todayStr).length || 0;
        const newUsersThisWeek = allUsers?.filter(u => u.created_at >= weekAgoStr).length || 0;
        const newUsersThisMonth = allUsers?.filter(u => u.created_at >= monthAgoStr).length || 0;

        const { count: totalMeals } = await supabase
          .from('meals')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalUsers,
          newUsersToday,
          newUsersThisWeek,
          newUsersThisMonth,
          totalMeals: totalMeals || 0,
          totalScans: totalMeals || 0,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-10 h-10 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Firehouse Fit Admin</h1>
              <p className="text-gray-600">App Statistics Dashboard</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-red-100 hover:border-red-300 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-red-600" />
                Total Users
              </CardTitle>
              <CardDescription>All registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">{stats.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-100 hover:border-blue-300 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                New Users Today
              </CardTitle>
              <CardDescription>Signed up in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{stats.newUsersToday.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 hover:border-green-300 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
                New Users This Week
              </CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{stats.newUsersThisWeek.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100 hover:border-orange-300 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                New Users This Month
              </CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600">{stats.newUsersThisMonth.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-300 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-purple-600" />
                Total Meals Logged
              </CardTitle>
              <CardDescription>All time meal scans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">{stats.totalMeals.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-teal-100 hover:border-teal-300 transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-teal-600" />
                Avg Meals per User
              </CardTitle>
              <CardDescription>Usage engagement metric</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-teal-600">
                {stats.totalUsers > 0 ? (stats.totalMeals / stats.totalUsers).toFixed(1) : '0'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Growth Overview</CardTitle>
            <CardDescription>User acquisition and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Daily Growth Rate</span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.totalUsers > 0 ? ((stats.newUsersToday / stats.totalUsers) * 100).toFixed(2) : '0'}%
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Weekly Growth Rate</span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.totalUsers > 0 ? ((stats.newUsersThisWeek / stats.totalUsers) * 100).toFixed(2) : '0'}%
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Monthly Growth Rate</span>
                <span className="text-lg font-bold text-gray-900">
                  {stats.totalUsers > 0 ? ((stats.newUsersThisMonth / stats.totalUsers) * 100).toFixed(2) : '0'}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
