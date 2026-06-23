import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiTrash2, FiEye } from 'react-icons/fi';

export default function Shortlist() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShortlist = async () => {
    try {
      const { data } = await api.get('/shortlist');
      setItems(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchShortlist(); }, []);

  const handleRemove = async (userId) => {
    await api.delete(`/shortlist/${userId}`);
    setItems((prev) => prev.filter((i) => i.savedUser?._id !== userId));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">{t('nav.shortlist')}</h1>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🔖</div>
          <h3 className="font-semibold text-gray-700">No shortlisted profiles yet</h3>
          <Link to="/search" className="btn-primary mt-4 inline-flex">{t('nav.search')}</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const u = item.savedUser;
            const p = u?.profileId;
            const photo = p?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(p?.fullName || u?.firstName || 'U')}&background=e91e8c&color=fff`;
            return (
              <div key={item._id} className="card overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img src={photo} alt={p?.fullName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{p?.fullName || `${u?.firstName} ${u?.lastName}`}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {[p?.age ? `${p.age} yrs` : null, p?.city, p?.religion].filter(Boolean).join(' • ')}
                  </p>
                  {p?.occupation && <p className="text-sm text-primary-500 mt-1">{p.occupation}</p>}
                  <div className="flex gap-2 mt-3">
                    <Link to={`/profile/${u?._id}`} className="btn-primary text-xs px-3 py-1.5 flex-1 justify-center">
                      <FiEye /> View
                    </Link>
                    <button
                      onClick={() => handleRemove(u?._id)}
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
