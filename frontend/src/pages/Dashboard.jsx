import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  FiHeart, FiMessageSquare, FiEye, FiStar, FiArrowRight,
  FiUser, FiAlertCircle, FiSearch, FiCheckCircle,
} from 'react-icons/fi';
import { fetchMyProfile } from '../redux/slices/profileSlice';
import { fetchSuggestedMatches } from '../redux/slices/matchSlice';
import { fetchNotifications } from '../redux/slices/notificationSlice';
import ProfileCard from '../components/match/ProfileCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MATRIMONY_IMAGES } from '../utils/matrimonyImages';

export default function Dashboard() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { myProfile } = useSelector((s) => s.profile);
  const { suggestions, loading: matchLoading } = useSelector((s) => s.match);
  const { items: notifications, unreadCount } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchSuggestedMatches({ limit: 6 }));
    dispatch(fetchNotifications({ limit: 5 }));
  }, [dispatch]);

  const completionScore = myProfile?.completionScore || user?.profileCompletionScore || 0;
  const newInterests = notifications.filter((n) => n.type === 'new_interest' && !n.isRead).length;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Hero banner — traditional Indian wedding photo */}
      <section className="relative overflow-hidden rounded-3xl shadow-card min-h-[240px] sm:min-h-[320px]">
        <img
          src={MATRIMONY_IMAGES.wedding}
          alt="Indian wedding ceremony"
          className="absolute inset-0 w-full h-full matrimony-photo"
          loading="eager"
        />
        {/* Soft left fade so faces stay visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />

        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-12 flex flex-col sm:flex-row sm:items-end justify-between gap-5 min-h-[240px] sm:min-h-[320px]">
          <div className="text-white max-w-lg drop-shadow-md">
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-secondary-200 mb-2">
              Vivansa · Indian Matrimony
            </p>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold leading-tight">
              {t('dashboard.welcome')}, {user?.firstName}!
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/90">
              {completionScore < 70
                ? t('dashboard.complete_profile')
                : 'Your journey to find a life partner continues. Explore new matches today.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/matches"
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-full hover:shadow-lg transition-shadow"
              >
                <FiHeart /> View Matches
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 bg-primary-600/90 text-white border border-white/30 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-primary-700 transition-colors"
              >
                <FiSearch /> Search Profiles
              </Link>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 bg-white/95 rounded-2xl px-5 py-4 shadow-lg text-gray-800">
            <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-secondary-400 shrink-0 bg-primary-100">
              {myProfile?.profilePhoto || user?.profileId?.profilePhoto ? (
                <img
                  src={myProfile?.profilePhoto || user?.profileId?.profilePhoto}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-gradient text-white font-bold text-lg">
                  {user?.firstName?.[0]}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">
                {user?.role === 'premium' ? '⭐ Premium' : 'Free Member'} · {completionScore}% complete
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FiUser className="text-primary-600" />}
          label={t('dashboard.profile_completion')}
          value={`${completionScore}%`}
          sub={completionScore < 80 ? 'Add more details' : 'Looking great!'}
          progress={completionScore}
        />
        <StatCard
          icon={<FiHeart className="text-primary-500" />}
          label={t('dashboard.new_interests')}
          value={newInterests}
          sub="Waiting for response"
        />
        <StatCard
          icon={<FiEye className="text-secondary-600" />}
          label={t('dashboard.recent_visitors')}
          value={myProfile?.profileViews || 0}
          sub="Profile views"
        />
        <StatCard
          icon={<FiMessageSquare className="text-emerald-600" />}
          label={t('dashboard.messages')}
          value={unreadCount}
          sub="Unread messages"
        />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/interests', title: 'Interests', desc: 'Accept or send interest requests', icon: FiHeart },
          { to: '/shortlist', title: 'Shortlist', desc: 'Saved profiles you like', icon: FiStar },
          { to: '/subscription', title: 'Go Premium', desc: 'Unlimited matches & messaging', icon: FiCheckCircle },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="card p-5 border border-primary-50 hover:shadow-card-hover hover:border-primary-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-3 group-hover:bg-primary-gradient group-hover:text-white transition-colors">
              <item.icon />
            </div>
            <h3 className="font-heading font-semibold text-gray-900">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Profile completion */}
      {completionScore < 80 && (
        <div className="rounded-2xl border border-primary-100 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-card">
          <div className="w-12 h-12 rounded-xl bg-primary-gradient flex items-center justify-center shrink-0 shadow-md">
            <FiAlertCircle className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Complete Your Vivansa Profile</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Your profile is {completionScore}% complete. Complete profiles get more matches.
            </p>
            <div className="mt-3 h-2 bg-primary-50 rounded-full w-full max-w-xs overflow-hidden">
              <div className="h-full bg-primary-gradient rounded-full" style={{ width: `${completionScore}%` }} />
            </div>
          </div>
          <Link to="/profile/edit" className="btn-primary text-sm shrink-0">
            Complete Profile <FiArrowRight />
          </Link>
        </div>
      )}

      {user?.role === 'user' && (
        <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-secondary-200 bg-gradient-to-r from-secondary-50 to-orange-50">
          <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center shrink-0 shadow">
            <FiStar className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              Upgrade to Vivansa Premium
              <span className="badge-premium">Gold</span>
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Unlimited views, messaging & priority visibility — like trusted Indian matrimony sites.
            </p>
          </div>
          <Link
            to="/subscription"
            className="inline-flex items-center gap-2 bg-gold-gradient text-white font-semibold px-5 py-2.5 rounded-full shrink-0 hover:shadow-lg transition-shadow"
          >
            Upgrade Now <FiArrowRight />
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 card p-5 border border-primary-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-heading text-gray-900">{t('notifications.title')}</h2>
            <Link to="/notifications" className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
              {t('dashboard.view_all')} <FiArrowRight className="text-xs" />
            </Link>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No new notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 4).map((n) => (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 p-3 rounded-xl ${
                    n.isRead ? 'bg-gray-50' : 'bg-primary-50 border border-primary-100'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.isRead ? 'bg-gray-200' : 'bg-primary-gradient'}`}>
                    <span className="text-sm">
                      {n.type === 'new_interest' ? '💌' : n.type === 'new_message' ? '💬' : n.type === 'profile_viewed' ? '👀' : '✅'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trust card with wedding photo */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl min-h-[220px] shadow-card">
          <img
            src={MATRIMONY_IMAGES.couple}
            alt="Happy couple on Vivansa"
            className="absolute inset-0 w-full h-full matrimony-photo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          <div className="relative z-10 h-full flex flex-col justify-end p-5 text-white">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full w-fit mb-3">
              <FiCheckCircle /> Verified Profiles
            </div>
            <h3 className="font-heading font-bold text-lg">Trust & Safety First</h3>
            <p className="text-sm text-white/85 mt-1.5 leading-relaxed">
              Vivansa helps families connect with confidence — the Indian way of finding a life partner.
            </p>
            <Link to="/profile/edit" className="mt-4 inline-flex text-sm font-semibold text-secondary-200 hover:text-white">
              Update My Profile →
            </Link>
          </div>
        </div>
      </div>

      {/* Suggested Matches */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-heading font-semibold text-gray-900">
              {t('dashboard.suggested_matches')}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Handpicked profiles matching your preferences</p>
          </div>
          <Link to="/matches" className="text-sm text-primary-600 hover:text-primary-800 flex items-center gap-1">
            {t('dashboard.view_all')} <FiArrowRight className="text-xs" />
          </Link>
        </div>

        {matchLoading ? (
          <LoadingSpinner text="Finding your matches..." />
        ) : suggestions.length === 0 ? (
          <div className="card p-10 text-center border border-primary-50">
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
                matchFactors={match.matchFactors}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, progress }) {
  return (
    <div className="card p-5 border border-primary-50 bg-white">
      <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-2xl font-bold font-heading text-gray-900">{value}</div>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 bg-primary-50 rounded-full overflow-hidden">
          <div className="h-full bg-primary-gradient rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
