import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FiMail, FiHeart } from 'react-icons/fi';
import api from '../services/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-hero-gradient pt-16 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-card p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <FiHeart className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">Forgot Password?</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset link</p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="font-semibold text-gray-900">Check Your Email!</h3>
              <p className="text-gray-500 text-sm mt-2">We've sent a password reset link to your email. It expires in 10 minutes.</p>
              <Link to="/login" className="btn-primary mt-6 inline-flex">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">{t('auth.email')}</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                    type="email" placeholder="you@example.com"
                    className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Sending...' : t('auth.send_reset')}
              </button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-primary-500 hover:text-primary-700">← Back to Login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
