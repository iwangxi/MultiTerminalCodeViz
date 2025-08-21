import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => {
          const currentIndex = languages.findIndex(lang => lang.code === i18n.language);
          const nextIndex = (currentIndex + 1) % languages.length;
          handleLanguageChange(languages[nextIndex].code);
        }}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded py-2 px-3 text-sm font-medium transition-colors border-0 flex items-center justify-center space-x-2"
        style={{ backgroundColor: '#4f46e5' }}
        aria-label={`${t('controls.language')} (${currentLanguage.name})`}
      >
        <span>{currentLanguage.flag}</span>
        <span>{t('controls.language')}: {currentLanguage.name}</span>
      </button>
    </div>
  );
}
