import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FiHeart, FiMessageSquare, FiEye, FiStar, FiArrowRight, FiUser, FiAlertCircle } from 'react-icons/fi';
import { fetchMyProfile } from '../redux/slices/profileSlice';
import { fetchSuggestedMatches } from '../redux/slices/matchSlice';
import { fetchNotifications } from '../redux/slices/notificationSlice';
import ProfileCard from '../components/match/ProfileCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myProfile, loading: profileLoading } = useSelector((s) => s.profile);
  const { suggestions, loading: matchLoading } = useSelector((s) => s.match);
  const { items: notifications, unreadCount } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchSuggestedMatches({ limit: 6 }));
    dispatch(fetchNotifications({ limit: 5 }));
  }, [dispatch]);

  const completionScore = myProfile?.completionScore || user?.profileCompletionScore || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            {t('dashboard.welcome')}, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {completionScore < 70
              ? t('dashboard.complete_profile')
              : 'Your profile is looking great. Check out your matches!'}
          </p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'user' && (
            <Link to="/subscription" className="btn-secondary text-sm px-4 py-2">
              <FiStar className="text-accent-gold" /> Upgrade to Premium
            </Link>
          )}
          <Link to="/profile/edit" className="btn-primary text-sm px-4 py-2">
            <FiUser /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FiUser className="text-blue-500" />}
          label={t('dashboard.profile_completion')}
          value={`${completionScore}%`}
          sub={completionScore < 80 ? 'Improve for more matches' : 'Looking great!'}
          color="blue"
          progress={completionScore}
        />
        <StatCard
          icon={<FiHeart className="text-pink-500" />}
          label={t('dashboard.new_interests')}
          value={notifications.filter((n) => n.type === 'new_interest' && !n.isRead).length}
          sub="Waiting for response"
          color="pink"
        />
        <StatCard
          icon={<FiEye className="text-purple-500" />}
          label={t('dashboard.recent_visitors')}
          value={myProfile?.profileViews || 0}
          sub="Profile views"
          color="purple"
        />
        <StatCard
          icon={<FiMessageSquare className="text-green-500" />}
          label={t('dashboard.messages')}
          value={unreadCount}
          sub="Unread messages"
          color="green"
        />
      </div>

      {/* Profile Completion CTA */}
      {completionScore < 80 && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-gradient flex items-center justify-center shrink-0">
            <FiAlertCircle className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Complete Your Profile to Get Better Matches</h3>
            <p className="text-sm text-gray-600 mt-0.5">Your profile is {completionScore}% complete. Add more details to appear in more searches.</p>
            <div className="mt-3 h-2 bg-white rounded-full w-full max-w-xs overflow-hidden">
              <div className="h-full bg-primary-gradient rounded-full transition-all" style={{ width: `${completionScore}%` }} />
            </div>
          </div>
          <Link to="/profile/edit" className="btn-primary text-sm shrink-0">
            Complete Profile <FiArrowRight />
          </Link>
        </div>
      )}

      {/* Subscription Status */}
      {user?.role === 'user' && (
        <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100">
          <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center shrink-0">
            <FiStar className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Upgrade to Premium</h3>
            <p className="text-sm text-gray-600 mt-0.5">Get unlimited profile views, messaging, and priority visibility.</p>
          </div>
          <Link to="/subscription" className="inline-flex items-center gap-2 bg-gold-gradient text-white font-semibold px-5 py-2.5 rounded-full shrink-0 hover:shadow-lg transition-shadow">
            Upgrade Now <FiArrowRight />
          </Link>
        </div>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-heading text-gray-900">{t('notifications.title')}</h2>
            <Link to="/notifications" className="text-sm text-primary-500 hover:text-primary-700 flex items-center gap-1">
              {t('dashboard.view_all')} <FiArrowRight className="text-xs" />
            </Link>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 4).map((n) => (
              <div key={n._id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${n.isRead ? 'bg-gray-50' : 'bg-primary-50 border border-primary-100'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.isRead ? 'bg-gray-200' : 'bg-primary-gradient'}`}>
                  <span className="text-sm">{n.type === 'new_interest' ? '💌' : n.type === 'new_message' ? '💬' : n.type === 'profile_viewed' ? '👀' : '✅'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Matches */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-heading font-semibold text-gray-900">{t('dashboard.suggested_matches')}</h2>
          <Link to="/matches" className="text-sm text-primary-500 hover:text-primary-700 flex items-center gap-1">
            {t('dashboard.view_all')} <FiArrowRight className="text-xs" />
          </Link>
        </div>

        {matchLoading ? (
          <LoadingSpinner text="Finding your matches..." />
        ) : suggestions.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="text-5xl mb-4">💑</div>
            <h3 className="font-semibold text-gray-800">{t('dashboard.no_matches')}</h3>
            <Link to="/profile/edit" className="btn-primary mt-4 inline-flex">Complete Profile</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {suggestions.slice(0, 6).map((match) => (
              <ProfileCard
                key={match.profile._id}
                profile={match.profile}
                user={match.profile.userId}
                compatibilityScore={match.compatibilityScore}
                matchReasons={match.matchReasons}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, progress }) {
  const colorMap = {
    blue: 'bg-blue-50',
    pink: 'bg-pink-50',
    purple: 'bg-purple-50',
    green: 'bg-green-50',
  };
  return (
    <div className="card p-5">
      <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold font-heading text-gray-900">{value}</div>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-gradient rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
