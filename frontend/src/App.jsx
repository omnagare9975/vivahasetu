import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchMe, setInitialized } from './redux/slices/authSlice';
import useBackNavigation from './hooks/useBackNavigation';

import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ViewProfile from './pages/ViewProfile';
import Search from './pages/Search';
import Help from './pages/Help';
import HowToUse from './pages/HowToUse';

import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Messages from './pages/Messages';
import Interests from './pages/Interests';
import Shortlist from './pages/Shortlist';
import EditProfile from './pages/EditProfile';
import Subscription from './pages/Subscription';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminVerifications from './pages/Admin/AdminVerifications';
import AdminPayments from './pages/Admin/AdminPayments';
import AdminReports from './pages/Admin/AdminReports';

import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedOutlet from './routes/ProtectedOutlet';

function AppRoutes() {
  useBackNavigation();

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile/:id" element={<ViewProfile />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Help />} />
        <Route path="/how-to-use" element={<HowToUse />} />
      </Route>

      <Route element={<ProtectedOutlet />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/interests" element={<Interests />} />
          <Route path="/shortlist" element={<Shortlist />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/app-guide" element={<HowToUse />} />
        </Route>
      </Route>

      <Route element={<ProtectedOutlet adminOnly />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/verifications" element={<AdminVerifications />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { token, initialized } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    } else {
      dispatch(setInitialized());
    }
  }, []);

  if (!initialized && token) {
    return <LoadingSpinner fullScreen text="Loading Vivansa..." />;
  }

  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-center"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        toastStyle={{ borderRadius: '12px', fontFamily: 'Inter, sans-serif' }}
      />
    </>
  );
}
