/**
 * Android / Capacitor back button + browser history hygiene.
 * - Uses history.back() when possible
 * - Avoids exiting the app unexpectedly on root routes
 * - Does not push duplicate entries
 */
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

const ROOT_PATHS = new Set(['/', '/dashboard', '/login', '/register']);

export default function useBackNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    let handle;
    let listener;

    const setup = async () => {
      try {
        const { App } = await import('@capacitor/app');
        handle = await App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack && !ROOT_PATHS.has(location.pathname)) {
            navigate(-1);
            return;
          }
          if (location.pathname !== '/' && location.pathname !== '/dashboard') {
            navigate(location.pathname.startsWith('/admin') ? '/admin' : '/dashboard', { replace: true });
            return;
          }
          App.exitApp();
        });
        listener = handle;
      } catch {
        // @capacitor/app may be unavailable in web builds
      }
    };

    setup();
    return () => {
      if (listener?.remove) listener.remove();
    };
  }, [navigate, location.pathname]);
}
