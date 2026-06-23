import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हि', name: 'हिंदी' },
  { code: 'mr', label: 'म', name: 'मराठी' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('vivahsetu_lang', code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors text-sm font-medium"
        aria-label="Switch Language"
      >
        <FiGlobe className="text-base" />
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-slide-up">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                i18n.language === lang.code
                  ? 'text-primary-600 bg-primary-50 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="w-6 text-center font-bold">{lang.label}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
