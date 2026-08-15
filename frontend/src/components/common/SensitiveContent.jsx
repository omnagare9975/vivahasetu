/**
 * Soft protection for sensitive UI (phones, messages, docs).
 * Discourages selection/copy; blurs content when the tab is hidden.
 * Does not claim to block screenshots on every device.
 */
import { useEffect, useState } from 'react';

export default function SensitiveContent({ children, className = '' }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <div
      className={`sensitive-content ${hidden ? 'sensitive-content--obscured' : ''} ${className}`}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}
