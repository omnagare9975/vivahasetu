import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff, FiHeart } from 'react-icons/fi';
import { loginUser, clearError } from '../redux/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient pt-16 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="glass-card p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <FiHeart className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">{t('auth.sign_in')}</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back to VivahSetu</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">{t('auth.email')}</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email', {
                    required: t('common.required'),
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                  })}
                  type="email"
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0">{t('auth.password')}</label>
                <Link to="/forgot-password" className="text-xs text-primary-500 hover:text-primary-700">
                  {t('auth.forgot_password')}
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password', { required: t('common.required') })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <><LoadingSpinner size="sm" /> Loading...</> : t('auth.sign_in')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.no_account')}{' '}
              <Link to="/register" className="text-primary-500 font-semibold hover:text-primary-700">
                {t('auth.sign_up')}
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-600 font-medium mb-1">Demo Credentials</p>
            <p className="text-xs text-blue-500">User: rahul@example.com / Test@123</p>
            <p className="text-xs text-blue-500">Admin: admin@vivahsetu.com / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
