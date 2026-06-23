import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiList, FiSearch } from 'react-icons/fi';
import { searchProfiles, setFilters, clearFilters } from '../redux/slices/matchSlice';
import SearchFilters from '../components/match/SearchFilters';
import ProfileCard from '../components/match/ProfileCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Search() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { searchResults, searchMeta, loading, filters } = useSelector((s) => s.match);
  const [localFilters, setLocalFilters] = useState(filters);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    dispatch(searchProfiles({ ...filters, page, limit: 12 }));
  }, [dispatch, page]);

  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
    setPage(1);
    dispatch(searchProfiles({ ...localFilters, page: 1, limit: 12 }));
    setMobileFilterOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    dispatch(clearFilters());
    setPage(1);
    dispatch(searchProfiles({ page: 1, limit: 12 }));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">{t('nav.search')}</h1>
          {searchMeta && (
            <p className="text-sm text-gray-500 mt-1">
              {t('common.showing')} {searchResults.length} {t('common.of')} {searchMeta.total} {t('common.results')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden btn-secondary text-sm px-3 py-2"
          >
            <FiSearch /> {t('match.filters')}
          </button>
          <div className="flex border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className={`${mobileFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-72 shrink-0`}>
          <SearchFilters
            filters={localFilters}
            onChange={setLocalFilters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <LoadingSpinner text={t('common.loading')} />
          ) : searchResults.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-semibold text-gray-800 text-lg">{t('match.no_results')}</h3>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
              <button onClick={handleClearFilters} className="btn-secondary mt-4 inline-flex">
                {t('match.clear_filters')}
              </button>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid'
                ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-5'
                : 'space-y-4'
              }>
                {searchResults.map((profile) => (
                  <ProfileCard
                    key={profile._id}
                    profile={profile}
                    user={profile.userId}
                    compact={viewMode === 'grid'}
                  />
                ))}
              </div>

              {/* Pagination */}
              {searchMeta && searchMeta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!searchMeta.hasPrev}
                    className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
                  >
                    {t('common.previous')}
                  </button>
                  <span className="text-sm text-gray-600 px-4">
                    {t('common.page')} {page} {t('common.of')} {searchMeta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!searchMeta.hasNext}
                    className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
                  >
                    {t('common.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
