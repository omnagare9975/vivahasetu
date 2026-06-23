import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiX, FiExternalLink } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function AdminVerifications() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/verifications');
      setProfiles(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVerifications(); }, []);

  const handleAction = async (id, status) => {
    try {
      await api.put(`/admin/verifications/${id}`, { status });
      toast.success(`Profile ${status}!`);
      fetchVerifications();
    } catch (err) { toast.error('Action failed'); }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">{t('admin.verifications')}</h1>

      {loading ? <p className="text-gray-400">Loading...</p> :
       profiles.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-12 text-center">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-gray-500">No pending verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div key={profile._id} className="bg-white rounded-2xl shadow-card p-5 flex flex-col sm:flex-row gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {profile.profilePhoto ? (
                    <img src={profile.profilePhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">👤</div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{profile.fullName}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {profile.userId?.email} • {profile.userId?.mobile}
                  </p>
                  <p className="text-sm text-gray-500">
                    {[profile.city, profile.state, profile.religion].filter(Boolean).join(' • ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Joined: {new Date(profile.userId?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Photo Thumbnails */}
              {profile.photos?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {profile.photos.slice(0, 3).map((photo) => (
                    <img key={photo._id} src={photo.url} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAction(profile._id, 'approved')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  <FiCheck /> {t('admin.approve')}
                </button>
                <button
                  onClick={() => handleAction(profile._id, 'rejected')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  <FiX /> {t('admin.reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
