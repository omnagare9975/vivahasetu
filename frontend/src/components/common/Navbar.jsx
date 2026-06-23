import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  FiHeart, FiMenu, FiX, FiBell, FiMessageSquare, FiUser,
  FiLogOut, FiSettings, FiShield, FiChevronDown,
} from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import { fetchNotifications } from '../../redux/slices/notificationSlice';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
      const interval = setInterval(() => dispatch(fetchNotifications()), 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';
  const navBg = scrolled || !isLandingPage
    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
    : 'bg-transparent';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary-gradient rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <FiHeart className="text-white text-lg" />
            </div>
            <div>
              <span className="text-xl font-heading font-bold text-gradient">VivahSetu</span>
              <p className="text-[10px] text-gray-400 leading-none hidden sm:block">Find Your Perfect Match</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">{t('nav.dashboard')}</NavLink>
                <NavLink to="/search">{t('nav.search')}</NavLink>
                <NavLink to="/matches">{t('nav.matches')}</NavLink>
                <NavLink to="/messages" badge={unreadCount}>
                  {t('nav.messages')}
                </NavLink>
                <NavLink to="/shortlist">{t('nav.shortlist')}</NavLink>
                <NavLink to="/subscription">{t('nav.subscription')}</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/">{t('nav.home')}</NavLink>
                <NavLink to="/search">{t('nav.search')}</NavLink>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                >
                  <FiBell className="text-xl" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-gradient flex items-center justify-center overflow-hidden">
                      {user?.profileId?.profilePhoto ? (
                        <img src={user.profileId.profilePhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {user?.firstName?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[100px] truncate">
                      {user?.firstName}
                    </span>
                    <FiChevronDown className={`text-gray-500 text-sm transition-transform ${profileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {profileDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-slide-up">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        {user?.role === 'premium' && (
                          <span className="badge-premium mt-1">⭐ Premium</span>
                        )}
                      </div>
                      <DropdownItem to="/profile/edit" icon={<FiUser />}>{t('nav.profile')}</DropdownItem>
                      <DropdownItem to="/settings" icon={<FiSettings />}>{t('nav.settings') || 'Settings'}</DropdownItem>
                      {user?.role === 'admin' && (
                        <DropdownItem to="/admin" icon={<FiShield />}>{t('nav.admin')}</DropdownItem>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <FiLogOut /> {t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm px-4 py-2">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary text-sm px-5 py-2">
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 ml-1"
            >
              {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {isAuthenticated ? (
              <>
                <MobileNavLink to="/dashboard">{t('nav.dashboard')}</MobileNavLink>
                <MobileNavLink to="/search">{t('nav.search')}</MobileNavLink>
                <MobileNavLink to="/matches">{t('nav.matches')}</MobileNavLink>
                <MobileNavLink to="/messages">{t('nav.messages')}</MobileNavLink>
                <MobileNavLink to="/shortlist">{t('nav.shortlist')}</MobileNavLink>
                <MobileNavLink to="/subscription">{t('nav.subscription')}</MobileNavLink>
                <MobileNavLink to="/profile/edit">{t('nav.profile')}</MobileNavLink>
                {user?.role === 'admin' && <MobileNavLink to="/admin">{t('nav.admin')}</MobileNavLink>}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-red-500 font-medium rounded-xl hover:bg-red-50"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/">{t('nav.home')}</MobileNavLink>
                <MobileNavLink to="/search">{t('nav.search')}</MobileNavLink>
                <MobileNavLink to="/login">{t('nav.login')}</MobileNavLink>
                <MobileNavLink to="/register">{t('nav.register')}</MobileNavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children, badge }) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
      }`}
    >
      {children}
      {badge > 0 && (
        <span className="min-w-[18px] h-[18px] bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}

function MobileNavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`block px-4 py-2.5 rounded-xl font-medium transition-colors ${
        active ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}

function DropdownItem({ to, icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <span className="text-gray-400">{icon}</span>
      {children}
    </Link>
  );
}
