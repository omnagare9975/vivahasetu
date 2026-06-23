import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchSuggestedMatches } from '../redux/slices/matchSlice';
import ProfileCard from '../components/match/ProfileCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Matches() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { suggestions, loading } = useSelector((s) => s.match);

  useEffect(() => {
    dispatch(fetchSuggestedMatches({ limit: 20 }));
  }, [dispatch]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">{t('dashboard.suggested_matches')}</h1>
        <p className="text-gray-500 text-sm mt-1">Profiles matched based on your preferences and compatibility score</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Finding your best matches..." />
      ) : suggestions.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">💑</div>
          <h3 className="font-semibold text-gray-800">{t('dashboard.no_matches')}</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((match) => (
            <ProfileCard
              key={match.profile._id}
              profile={match.profile}
              user={match.profile.userId}
              compatibilityScore={match.compatibilityScore}
              matchReasons={match.matchReasons}
            />
          ))}
        </div>
      )}
    </div>
  );
}
