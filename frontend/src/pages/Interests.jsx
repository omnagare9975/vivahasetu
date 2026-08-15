import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiArrowRight, FiMessageSquare, FiUser } from 'react-icons/fi';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Interests() {
  const { t } = useTranslation();
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterests = async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([
        api.get('/interests/received'),
        api.get('/interests/sent'),
      ]);
      setReceived(r.data.data || []);
      setSent(s.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInterests(); }, []);

  const handleRespond = async (id, status) => {
    try {
      await api.put(`/interests/${id}/respond`, { status });
      toast.success(status === 'accepted' ? '✅ Interest accepted!' : 'Interest declined');
      fetchInterests();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleCancel = async (id) => {
    try {
      await api.delete(`/interests/${id}`);
      toast.success('Interest cancelled');
      fetchInterests();
    } catch (err) { toast.error('Failed to cancel'); }
  };

  const handleStartChat = async (userId) => {
    try {
      const { data } = await api.get(`/messages/conversations/${userId}`);
      navigate('/messages', { state: { openConversation: data.data } });
    } catch (err) {
      toast.error('Could not open conversation');
    }
  };

  const getProfileData = (interest, isReceived) => {
    const person = isReceived ? interest.sender : interest.receiver;
    return {
      name: person?.profileId?.fullName || `${person?.firstName} ${person?.lastName}`,
      photo: person?.profileId?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(person?.firstName || 'U')}&background=e91e8c&color=fff`,
      age: person?.profileId?.age,
      city: person?.profileId?.city,
      id: person?._id,
    };
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-5">{t('interest.sent')}</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {['received', 'sent'].map((t2) => (
          <button
            key={t2}
            onClick={() => setTab(t2)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              tab === t2 ? 'bg-primary-gradient text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t2 === 'received' ? `${t('interest.received')} (${received.length})` : `${t('interest.sent')} (${sent.length})`}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-3">
          {(tab === 'received' ? received : sent).map((interest) => {
            const p = getProfileData(interest, tab === 'received');
            return (
              <div key={interest._id} className="card p-4 flex items-center gap-4">
                <img src={p.photo} alt={p.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.age ? `${p.age} yrs` : ''}{p.city ? ` • ${p.city}` : ''}</p>
                  {interest.message && (
                    <p className="text-sm text-gray-600 mt-1 italic line-clamp-1">"{interest.message}"</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <StatusBadge status={interest.status} />
                  {tab === 'received' && interest.status === 'pending' && (
                    <>
                      <button onClick={() => handleRespond(interest._id, 'accepted')}
                        className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-colors" title="Accept">
                        <FiCheck />
                      </button>
                      <button onClick={() => handleRespond(interest._id, 'rejected')}
                        className="p-2 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 transition-colors" title="Decline">
                        <FiX />
                      </button>
                    </>
                  )}
                  {interest.status === 'accepted' && (
                    <button
                      onClick={() => handleStartChat(p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-gradient text-white text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      <FiMessageSquare className="text-sm" /> Message
                    </button>
                  )}
                  <Link to={`/profile/${p.id}`}
                    className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors" title="View Profile">
                    <FiUser className="text-sm" />
                  </Link>
                  {tab === 'sent' && interest.status === 'pending' && (
                    <button onClick={() => handleCancel(interest._id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                      {t('interest.cancel')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {(tab === 'received' ? received : sent).length === 0 && (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4">💌</div>
              <p className="text-gray-500">{tab === 'received' ? t('interest.no_received') : t('interest.no_sent')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || map.pending}`}>
      {status}
    </span>
  );
}
