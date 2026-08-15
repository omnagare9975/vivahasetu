import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiX } from 'react-icons/fi';
import api from '../../services/api';

const REASONS = [
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'incorrect_information', label: 'Incorrect information' },
  { value: 'suspicious_activity', label: 'Suspicious activity' },
  { value: 'other', label: 'Other' },
];

export default function ReportProfileModal({ reportedUserId, onClose }) {
  const [reason, setReason] = useState('fake_profile');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reports/profiles', { reportedUserId, reason, description });
      toast.success('Report submitted. Thank you for helping keep Vivansa safe.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-bold text-gray-900">Report Profile</h3>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="input-field">
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Details (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              className="input-field resize-none"
              placeholder="Tell us more..."
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
