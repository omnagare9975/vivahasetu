import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUsers, FiStar, FiDollarSign, FiActivity, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">Loading stats...</div>;

  const cards = [
    { label: t('admin.total_users'), value: stats?.totalUsers || 0, icon: FiUsers, color: 'blue', change: '+12%' },
    { label: t('admin.active_users'), value: stats?.activeUsers || 0, icon: FiActivity, color: 'green', change: '+8%' },
    { label: t('admin.premium_users'), value: stats?.premiumUsers || 0, icon: FiStar, color: 'purple', change: '+24%' },
    { label: t('admin.total_revenue'), value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: 'yellow', change: '+18%' },
    { label: t('admin.monthly_revenue'), value: `₹${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: FiTrendingUp, color: 'pink', change: '+5%' },
    { label: t('admin.pending_verifications'), value: stats?.pendingVerifications || 0, icon: FiCheckCircle, color: 'orange', change: '' },
  ];

  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    pink: 'bg-pink-100 text-pink-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900">{t('admin.dashboard')}</h1>
        <p className="text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[card.color]}`}>
                <card.icon className="text-xl" />
              </div>
              {card.change && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                  {card.change}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      {stats?.recentUsers?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Registrations</h3>
          <div className="space-y-3">
            {stats.recentUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-gradient flex items-center justify-center text-white text-sm font-bold">
                  {u.firstName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'premium' ? 'bg-purple-100 text-purple-700' : u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
