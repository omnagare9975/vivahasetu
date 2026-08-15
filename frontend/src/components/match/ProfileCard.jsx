import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHeart, FiMapPin, FiBriefcase, FiStar, FiCheckCircle } from 'react-icons/fi';

export default function ProfileCard({
  profile,
  user,
  compatibilityScore,
  matchReasons = [],
  matchFactors = [],
  compact = false,
}) {
  const { t } = useTranslation();
  if (!profile) return null;

  const profilePhoto = profile.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=e91e8c&color=fff&size=200`;
  const factors = matchFactors.length
    ? matchFactors.filter((f) => f.matched).slice(0, 6)
    : matchReasons.slice(0, 5).map((r) => ({ label: r, matched: true }));

  if (compact) {
    return (
      <Link to={`/profile/${user?._id || profile.userId}`} className="block group">
        <div className="card overflow-hidden hover:shadow-card-hover transition-all duration-300 group-hover:-translate-y-1">
          <div className="relative h-48 overflow-hidden">
            <img src={profilePhoto} alt={profile.fullName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            {user?.role === 'premium' && (
              <div className="absolute top-2 left-2 badge-premium">⭐ Premium</div>
            )}
            {profile.isVerified && (
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                <FiCheckCircle className="text-sm" />
              </div>
            )}
            {compatibilityScore != null && (
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                {compatibilityScore}% {t('match.compatible')}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 truncate">{profile.fullName || 'Unknown'}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {profile.age ? `${profile.age} ${t('common.years')}` : ''}{profile.age && profile.religion ? ' • ' : ''}{profile.religion || ''}
            </p>
            {(profile.city || profile.state) && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                <FiMapPin className="shrink-0" />
                <span className="truncate">{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {factors.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {factors.slice(0, 2).map((f) => (
                  <span key={f.label} className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded border border-green-100">
                    {f.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-0">
        <div className="relative sm:w-52 h-56 sm:h-auto overflow-hidden shrink-0">
          <img src={profilePhoto} alt={profile.fullName} className="w-full h-full object-cover" />
          {user?.role === 'premium' && (
            <div className="absolute top-3 left-3 badge-premium">⭐ Premium</div>
          )}
          {profile.isVerified && (
            <div className="absolute top-3 right-3 badge-verified">
              <FiCheckCircle /> Verified
            </div>
          )}
        </div>

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xl font-semibold font-heading text-gray-900">{profile.fullName}</h3>
              <p className="text-gray-500 text-sm mt-0.5">
                {[
                  profile.age ? `${profile.age} yrs` : null,
                  profile.religion,
                  profile.maritalStatus?.replace(/_/g, ' '),
                ].filter(Boolean).join(' • ')}
              </p>
            </div>
            {compatibilityScore != null && (
              <div className="shrink-0 text-center bg-primary-50 border border-primary-100 rounded-xl px-3 py-2">
                <div className="text-2xl font-bold text-gradient">{compatibilityScore}%</div>
                <div className="text-[10px] text-gray-500 font-medium">Match</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            {profile.city && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <FiMapPin className="text-primary-400 shrink-0" />
                <span className="truncate">{profile.city}, {profile.state}</span>
              </div>
            )}
            {profile.occupation && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <FiBriefcase className="text-primary-400 shrink-0" />
                <span className="truncate">{profile.occupation}</span>
              </div>
            )}
            {profile.education && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <FiStar className="text-primary-400 shrink-0" />
                <span className="truncate">{profile.education}</span>
              </div>
            )}
            {profile.annualIncome && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <span className="text-primary-400 font-bold text-xs">₹</span>
                <span className="truncate">{profile.annualIncome}</span>
              </div>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-gray-500 mt-3 line-clamp-2">{profile.bio}</p>
          )}

          {factors.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 mb-1.5">{t('match.match_reasons')}</p>
              <div className="flex flex-wrap gap-1.5">
                {factors.map((f) => (
                  <span key={f.label} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                    ✓ {f.label}{f.detail ? `: ${f.detail}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Link to={`/profile/${user?._id || profile.userId}`} className="btn-primary text-sm px-5 py-2">
              {t('match.view_profile')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
