import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiPhone, FiCalendar, FiEye, FiEyeOff, FiHeart } from 'react-icons/fi';
import { registerUser } from '../redux/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Register() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Welcome to VivahSetu! Please verify your email.');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient pt-16 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="glass-card p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <FiHeart className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">{t('auth.register')}</h1>
            <p className="text-gray-500 text-sm mt-1">Start your journey to find your perfect match</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('auth.first_name')}</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    {...register('firstName', { required: t('common.required') })}
                    placeholder="Rahul"
                    className={`input-field pl-9 py-3 text-sm ${errors.firstName ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">{t('auth.last_name')}</label>
                <input
                  {...register('lastName', { required: t('common.required') })}
                  placeholder="Sharma"
                  className={`input-field py-3 text-sm ${errors.lastName ? 'border-red-400' : ''}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
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
                  placeholder="rahul@example.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="label">{t('auth.mobile')}</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <span className="text-sm">🇮🇳</span>
                  <span className="text-gray-400 text-sm">+91</span>
                </div>
                <input
                  {...register('mobile', {
                    required: t('common.required'),
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid Indian mobile number' },
                  })}
                  type="tel"
                  placeholder="9876543210"
                  className={`input-field pl-16 ${errors.mobile ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
            </div>

            {/* Gender & DOB */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('auth.gender')}</label>
                <select
                  {...register('gender', { required: t('common.required') })}
                  className={`input-field text-sm ${errors.gender ? 'border-red-400' : ''}`}
                >
                  <option value="">Select</option>
                  <option value="male">{t('auth.male')}</option>
                  <option value="female">{t('auth.female')}</option>
                  <option value="other">{t('auth.other')}</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
              </div>
              <div>
                <label className="label">{t('auth.dob')}</label>
                <div className="relative">
                  <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    {...register('dateOfBirth', { required: t('common.required') })}
                    type="date"
                    max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className={`input-field pl-9 text-sm ${errors.dateOfBirth ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">{t('auth.password')}</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password', {
                    required: t('common.required'),
                    minLength: { value: 6, message: 'Min 6 characters' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">{t('auth.confirm_password')}</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('confirmPassword', {
                    required: t('common.required'),
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                  type="password"
                  placeholder="••••••••"
                  className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? <><LoadingSpinner size="sm" /> Creating Account...</> : `${t('auth.sign_up')} — It's Free!`}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By registering, you agree to our{' '}
              <Link to="/terms" className="text-primary-500">Terms</Link> &{' '}
              <Link to="/privacy" className="text-primary-500">Privacy Policy</Link>
            </p>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.have_account')}{' '}
              <Link to="/login" className="text-primary-500 font-semibold hover:text-primary-700">
                {t('auth.sign_in')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
