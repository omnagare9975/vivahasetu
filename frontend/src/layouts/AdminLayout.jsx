import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiGrid, FiUsers, FiCheckCircle, FiCreditCard, FiLogOut } from 'react-icons/fi';
import { FiHeart } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin', icon: FiGrid, label: t('admin.dashboard'), exact: true },
    { to: '/admin/users', icon: FiUsers, label: t('admin.users') },
    { to: '/admin/verifications', icon: FiCheckCircle, label: t('admin.verifications') },
    { to: '/admin/payments', icon: FiCreditCard, label: t('admin.payments') },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0 fixed left-0 top-0 bottom-0">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-gradient rounded-xl flex items-center justify-center">
              <FiHeart className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white">VivahSetu</span>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all text-sm font-medium ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="text-lg" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
          >
            <FiLogOut /> {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
