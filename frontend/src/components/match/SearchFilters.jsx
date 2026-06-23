import { useTranslation } from 'react-i18next';
import { FiX } from 'react-icons/fi';

export default function SearchFilters({ filters, onChange, onApply, onClear }) {
  const { t } = useTranslation();

  const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Jewish', 'Other'];
  const STATES = ['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];
  const EDUCATION = ["High School", "Diploma", "Bachelor's", "Master's", "MBA", "PhD", "MBBS", "CA", "Other"];
  const OCCUPATION = ['Software Engineer', 'Doctor', 'Engineer', 'Business Owner', 'Government Job', 'Teacher', 'Lawyer', 'CA', 'Architect', 'Other'];
  const MOTHER_TONGUE = ['Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Punjabi', 'Odia'];

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{t('match.filters')}</h3>
        <button onClick={onClear} className="text-xs text-primary-500 hover:text-primary-700 flex items-center gap-1">
          <FiX /> {t('match.clear_filters')}
        </button>
      </div>

      {/* Age Range */}
      <FilterGroup label={t('profile.age')}>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" min={18} max={60} value={filters.ageMin || ''}
            onChange={(e) => handleChange('ageMin', e.target.value)}
            className="input-field text-sm py-2 px-3" />
          <input type="number" placeholder="Max" min={18} max={70} value={filters.ageMax || ''}
            onChange={(e) => handleChange('ageMax', e.target.value)}
            className="input-field text-sm py-2 px-3" />
        </div>
      </FilterGroup>

      {/* Gender */}
      <FilterGroup label={t('auth.gender')}>
        <select value={filters.gender || ''} onChange={(e) => handleChange('gender', e.target.value)}
          className="input-field text-sm py-2">
          <option value="">Any</option>
          <option value="male">{t('auth.male')}</option>
          <option value="female">{t('auth.female')}</option>
        </select>
      </FilterGroup>

      {/* Religion */}
      <FilterGroup label={t('profile.religion')}>
        <select value={filters.religion || ''} onChange={(e) => handleChange('religion', e.target.value)}
          className="input-field text-sm py-2">
          <option value="">Any</option>
          {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </FilterGroup>

      {/* Mother Tongue */}
      <FilterGroup label={t('profile.mother_tongue')}>
        <select value={filters.motherTongue || ''} onChange={(e) => handleChange('motherTongue', e.target.value)}
          className="input-field text-sm py-2">
          <option value="">Any</option>
          {MOTHER_TONGUE.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </FilterGroup>

      {/* Education */}
      <FilterGroup label={t('profile.education')}>
        <select value={filters.education || ''} onChange={(e) => handleChange('education', e.target.value)}
          className="input-field text-sm py-2">
          <option value="">Any</option>
          {EDUCATION.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </FilterGroup>

      {/* Occupation */}
      <FilterGroup label={t('profile.occupation')}>
        <select value={filters.occupation || ''} onChange={(e) => handleChange('occupation', e.target.value)}
          className="input-field text-sm py-2">
          <option value="">Any</option>
          {OCCUPATION.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </FilterGroup>

      {/* State */}
      <FilterGroup label={t('profile.state')}>
        <select value={filters.state || ''} onChange={(e) => handleChange('state', e.target.value)}
          className="input-field text-sm py-2">
          <option value="">Any</option>
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </FilterGroup>

      <button onClick={onApply} className="btn-primary w-full">
        {t('match.apply_filters')}
      </button>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
