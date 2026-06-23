import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiLock, FiEye, FiEyeOff, FiHeart } from 'react-icons/fi';
import api from '../services/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      if (data.data?.token) localStorage.setItem('vs_token', data.data.token);
      toast.success('Password reset! You are now logged in.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
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
            <h1 className="text-2xl font-heading font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your new password</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })}
                  type={showPw ? 'text' : 'password'}
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="New password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('confirmPassword', {
                    required: 'Required',
                    validate: (v) => v === watch('password') || 'Passwords do not match',
                  })}
                  type="password"
                  className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  placeholder="Confirm password"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-primary-500">← Back to Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
