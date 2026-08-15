import { Link } from 'react-router-dom';

const ADS = [
  {
    id: 'photo',
    title: 'Wedding Photography',
    subtitle: 'Capture your special day with trusted local studios',
    cta: 'Explore photographers',
    href: '/help',
    accent: 'from-rose-700/90 to-rose-900/80',
  },
  {
    id: 'services',
    title: 'Wedding Services',
    subtitle: 'Decor, catering & planning partners for your ceremony',
    cta: 'View wedding services',
    href: '/help',
    accent: 'from-amber-700/90 to-amber-900/80',
  },
];

export default function AdBanner({ placement = 'sidebar' }) {
  const ad = placement === 'profile' ? ADS[1] : ADS[Math.floor(Date.now() / 60000) % ADS.length];

  return (
    <aside
      className={`relative overflow-hidden rounded-2xl text-white bg-gradient-to-br ${ad.accent} p-4`}
      aria-label="Advertisement"
    >
      <p className="text-[10px] uppercase tracking-widest text-white/70 mb-2">Sponsored</p>
      <h4 className="font-heading font-semibold text-base leading-snug">{ad.title}</h4>
      <p className="text-sm text-white/85 mt-1 leading-relaxed">{ad.subtitle}</p>
      <Link
        to={ad.href}
        className="inline-block mt-3 text-xs font-semibold underline underline-offset-2 hover:text-white"
      >
        {ad.cta}
      </Link>
    </aside>
  );
}
