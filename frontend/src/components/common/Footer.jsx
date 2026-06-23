import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHeart, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-gradient rounded-xl flex items-center justify-center">
                <FiHeart className="text-white text-lg" />
              </div>
              <span className="text-xl font-heading font-bold text-white">VivahSetu</span>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              {t('footer.tagline')} — India's most trusted matrimony platform since 2026.
            </p>
            <div className="flex gap-3">
              {[FiInstagram, FiFacebook, FiTwitter, FiYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors text-gray-400 hover:text-white"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                ['About Us', '/about'], ['Careers', '/careers'],
                ['Press', '/press'], ['Blog', '/blog'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm hover:text-primary-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                [t('footer.help'), '/help'], [t('footer.contact'), '/contact'],
                [t('footer.success'), '/success-stories'], ['Safety Tips', '/safety'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm hover:text-primary-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {[
                [t('footer.privacy'), '/privacy'], [t('footer.terms'), '/terms'],
                ['Cookie Policy', '/cookies'], ['Sitemap', '/sitemap.xml'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm hover:text-primary-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">{t('footer.copyright')}</p>
          <p className="text-sm text-gray-500">{t('footer.made_with')}</p>
        </div>
      </div>
    </footer>
  );
}
