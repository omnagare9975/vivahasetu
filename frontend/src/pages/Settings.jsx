import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import { updatePreferences } from '../redux/slices/authSlice';

export default function Settings() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState('password');
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [saving, setSaving] = useState(false);

  const onChangePassword = async (data) => {
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully!');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const onSavePreferences = async (data) => {
    setSaving(true);
    const result = await dispatch(updatePreferences(data));
    setSaving(false);
    if (updatePreferences.fulfilled.match(result)) {
      toast.success('Preferences saved!');
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-2 mb-5">
        {['password', 'notifications', 'privacy'].map((t2) => (
          <button key={t2} onClick={() => setTab(t2)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === t2 ? 'bg-primary-gradient text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t2}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {tab === 'password' && (
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
            <div>
              <label className="label">Current Password</label>
              <input {...register('currentPassword', { required: 'Required' })} type="password" className="input-field" />
              {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="label">New Password</label>
              <input {...register('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} type="password" className="input-field" />
              {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input {...register('confirmPassword', {
                required: 'Required',
                validate: (v) => v === watch('newPassword') || 'Passwords do not match',
              })} type="password" className="input-field" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Update Password'}</button>
          </form>
        )}

        {tab === 'notifications' && (
          <form onSubmit={handleSubmit(onSavePreferences)} className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Notification Preferences</h3>
            {[
              { key: 'notificationPreferences.newInterest', label: 'New Interest Received' },
              { key: 'notificationPreferences.interestAccepted', label: 'Interest Accepted' },
              { key: 'notificationPreferences.newMessage', label: 'New Message' },
              { key: 'notificationPreferences.profileViewed', label: 'Profile Viewed' },
              { key: 'notificationPreferences.membershipExpiry', label: 'Membership Expiry' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input {...register(item.key)} type="checkbox" defaultChecked={true} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-500 transition-colors" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
                </label>
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Preferences'}</button>
          </form>
        )}

        {tab === 'privacy' && (
          <form onSubmit={handleSubmit(onSavePreferences)} className="space-y-4">
            <h3 className="font-semibold text-gray-800 mb-4">Privacy Settings</h3>
            <div>
              <label className="label">Profile Visibility</label>
              <select {...register('privacySettings.profileVisibility')} className="input-field">
                <option value="all">Visible to All</option>
                <option value="members">Members Only</option>
                <option value="premium">Premium Members Only</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Show Mobile Number</span>
                <p className="text-xs text-gray-400">Allow matches to see your mobile</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input {...register('privacySettings.showMobile')} type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-500 transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
              </label>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Settings'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
