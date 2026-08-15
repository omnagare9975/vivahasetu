import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiEye, FiEyeOff, FiHeart, FiAlertCircle } from 'react-icons/fi';
import { loginUser, clearError } from '../redux/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error: authError, isAuthenticated } = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, formState: { errors }, setFocus } = useForm();

  const from = location.state?.from?.pathname || '/dashboard';

  // If already logged in, go to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const onSubmit = async (data) => {
    setFormError('');
    dispatch(clearError());

    const result = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back to Vivansa! 👋', {
        position: 'top-center',
        autoClose: 2500,
      });
      navigate(from, { replace: true });
      return;
    }

    // Failed login — show clear feedback (same style as success toast)
    const message =
      result.payload ||
      authError ||
      'Invalid email or password. Please try again.';

    setFormError(message);
    toast.error(message, {
      position: 'top-center',
      autoClose: 4000,
      icon: '🔒',
    });

    // Highlight password field for wrong credentials
    setFocus('password');
  };

  return (
    <div className="min-h-screen bg-hero-gradient pt-16 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Soft Indian pattern backdrop */}
      <div className="absolute inset-0 matrimony-pattern opacity-40 pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        <div className="glass-card p-8 shadow-xl border border-primary-100/60">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <FiHeart className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">{t('auth.sign_in')}</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back to Vivansa</p>
          </div>

          {/* Inline error banner (visible even if toast is missed) */}
          {formError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-slide-up"
            >
              <FiAlertCircle className="mt-0.5 shrink-0 text-red-500 text-lg" />
              <div>
                <p className="font-semibold">Login failed</p>
                <p className="mt-0.5 text-red-600/90">{formError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label className="label">{t('auth.email')}</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email', {
                    required: t('common.required'),
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Please enter a valid email address' },
                    onChange: () => formError && setFormError(''),
                  })}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email || formError ? 'border-red-400 ring-1 ring-red-200' : ''}`}
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
                  {...register('password', {
                    required: 'Password is required',
                    onChange: () => formError && setFormError(''),
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input-field pl-10 pr-10 ${errors.password || formError ? 'border-red-400 ring-1 ring-red-200' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <><LoadingSpinner size="sm" /> Signing in...</> : t('auth.sign_in')}
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

          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs text-amber-700 font-medium mb-1">Demo Credentials</p>
            <p className="text-xs text-amber-600">User: rahul@example.com / Test@123</p>
            <p className="text-xs text-amber-600">Admin: admin@vivahsetu.com / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
