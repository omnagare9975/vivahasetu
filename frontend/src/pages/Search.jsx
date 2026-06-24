import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiList, FiFilter, FiX } from 'react-icons/fi';
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

  const activeFilterCount = Object.values(localFilters).filter((v) => v !== '' && v != null).length;

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
    setMobileFilterOpen(false);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-gray-900">{t('nav.search')}</h1>
          {searchMeta && (
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              {searchResults.length} of {searchMeta.total} results
            </p>
          )}
        </div>
        <div className="flex border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-500'}`}
          >
            <FiGrid />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-500'}`}
          >
            <FiList />
          </button>
        </div>
      </div>

      {/* Mobile Filter Button — full width, prominent */}
      <button
        onClick={() => setMobileFilterOpen(true)}
        className="lg:hidden w-full flex items-center justify-between gap-2 mb-4 px-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm active:bg-gray-50"
      >
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <FiFilter className="text-primary-500" />
          <span>Search Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">Tap to open →</span>
      </button>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Drawer Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Search Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 rounded-full bg-gray-100 text-gray-500"
              >
                <FiX />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <SearchFilters
                filters={localFilters}
                onChange={setLocalFilters}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filters Sidebar — desktop only */}
        <div className="hidden lg:block w-72 shrink-0">
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
            <div className="card p-10 text-center">
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
                ? 'grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5'
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
                  <span className="text-sm text-gray-600 px-3">
                    {page} / {searchMeta.totalPages}
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
