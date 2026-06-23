import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  FiGrid, FiSearch, FiHeart, FiMessageSquare, FiBookmark,
  FiUser, FiStar, FiBell, FiSettings, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import Navbar from '../components/common/Navbar';

export default function DashboardLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: FiGrid, label: t('nav.dashboard') },
    { to: '/search', icon: FiSearch, label: t('nav.search') },
    { to: '/matches', icon: FiHeart, label: t('nav.matches') },
    { to: '/messages', icon: FiMessageSquare, label: t('nav.messages'), badge: unreadCount },
    { to: '/shortlist', icon: FiBookmark, label: t('nav.shortlist') },
    { to: '/subscription', icon: FiStar, label: t('nav.subscription') },
    { to: '/notifications', icon: FiBell, label: t('nav.notifications'), badge: unreadCount },
    { to: '/profile/edit', icon: FiUser, label: t('nav.profile') },
    { to: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside
          className={`hidden lg:flex flex-col fixed left-0 top-16 bottom-0 bg-white border-r border-gray-100 shadow-sm transition-all duration-300 z-40 ${
            collapsed ? 'w-16' : 'w-60'
          }`}
        >
          {/* Profile Summary */}
          {!collapsed && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center overflow-hidden shrink-0">
                  {user?.profileId?.profilePhoto ? (
                    <img src={user.profileId.profilePhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold">{user?.firstName?.[0]}</span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-gray-800 text-sm truncate">{user?.firstName} {user?.lastName}</p>
                  {user?.role === 'premium' ? (
                    <span className="badge-premium text-[10px]">⭐ Premium</span>
                  ) : (
                    <span className="text-xs text-gray-400">Free Member</span>
                  )}
                </div>
              </div>
              {user?.profileCompletionScore !== undefined && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Profile</span>
                    <span>{user.profileCompletionScore}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-gradient rounded-full transition-all"
                      style={{ width: `${user.profileCompletionScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nav Items */}
          <nav className="flex-1 p-2 overflow-y-auto">
            {navItems.map((item) => {
              const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all group relative ${
                    active
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`text-lg shrink-0 ${active ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {item.badge > 0 && (
                    <span className={`min-w-[18px] h-[18px] bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ${collapsed ? 'absolute top-1 right-1' : 'ml-auto'}`}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Toggle */}
          <div className="p-2 border-t border-gray-100">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center py-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors"
            >
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-60'} min-h-[calc(100vh-4rem)]`}>
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
