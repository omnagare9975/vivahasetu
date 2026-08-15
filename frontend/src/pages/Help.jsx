import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiHelpCircle, FiMail, FiBookOpen } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Help() {
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    subject: '',
    message: '',
    category: 'general',
  });
  const [sending, setSending] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/reports/support', form);
      toast.success('Support request sent. We will reply soon.');
      setForm((f) => ({ ...f, subject: '', message: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 flex items-center gap-2">
          <FiHelpCircle className="text-primary-500" /> Help & Support
        </h1>
        <p className="text-gray-500 mt-2">Get help with your account, report issues, or learn how Vivansa works.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link to="/how-to-use" className="card p-5 hover:shadow-card-hover transition-shadow">
          <FiBookOpen className="text-primary-500 text-xl mb-2" />
          <h3 className="font-semibold text-gray-900">How to Use App</h3>
          <p className="text-sm text-gray-500 mt-1">Profile, matching, interests, messaging & more</p>
        </Link>
        <a href="mailto:support@vivansa.com" className="card p-5 hover:shadow-card-hover transition-shadow">
          <FiMail className="text-primary-500 text-xl mb-2" />
          <h3 className="font-semibold text-gray-900">Email Us</h3>
          <p className="text-sm text-gray-500 mt-1">support@vivansa.com</p>
        </a>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Contact Support</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input name="name" value={form.name} onChange={onChange} required className="input-field" />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={onChange} required className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select name="category" value={form.category} onChange={onChange} className="input-field">
              <option value="general">General</option>
              <option value="account">Account</option>
              <option value="payment">Payment</option>
              <option value="report">Report / Safety</option>
              <option value="verification">Verification</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Subject</label>
            <input name="subject" value={form.subject} onChange={onChange} required className="input-field" maxLength={200} />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea name="message" value={form.message} onChange={onChange} required rows={5} className="input-field resize-none" maxLength={2000} />
          </div>
          <button type="submit" disabled={sending} className="btn-primary">
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
