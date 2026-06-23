import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FiBell } from 'react-icons/fi';
import {
  fetchNotifications,
  markNotificationRead,
  markAllRead,
} from '../redux/slices/notificationSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Notifications() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, loading, unreadCount } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = (id) => dispatch(markNotificationRead(id));
  const handleMarkAll = () => dispatch(markAllRead());

  const ICONS = {
    new_interest: '💌',
    interest_accepted: '🎉',
    interest_rejected: '😔',
    new_message: '💬',
    profile_viewed: '👀',
    membership_expiry: '⚠️',
    profile_approved: '✅',
    profile_rejected: '❌',
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">{t('notifications.title')}</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="btn-secondary text-sm px-4 py-2">
            {t('notifications.mark_all_read')}
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : items.length === 0 ? (
        <div className="card p-12 text-center">
          <FiBell className="text-5xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">{t('notifications.no_notifications')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                n.isRead
                  ? 'bg-white border-gray-100 hover:bg-gray-50'
                  : 'bg-primary-50 border-primary-100 hover:bg-primary-100'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 ${n.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                {ICONS[n.type] || '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                  {n.title}
                </p>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1.5">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
