import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言文件
import en from '../locales/en.json';
import zh from '../locales/zh.json';

const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  }
};

i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 传递 i18n 实例给 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    resources,
    
    // 语言检测选项
    detection: {
      // 检测顺序：localStorage -> navigator -> 默认语言
      order: ['localStorage', 'navigator', 'htmlTag'],
      // 缓存用户语言偏好
      caches: ['localStorage'],
      // localStorage 中的键名
      lookupLocalStorage: 'i18nextLng',
    },

    // 默认语言
    fallbackLng: 'en',
    
    // 调试模式（生产环境建议关闭）
    debug: import.meta.env.DEV,

    interpolation: {
      // React 已经默认转义了，所以不需要 i18next 转义
      escapeValue: false,
    },

    // 复数规则
    pluralSeparator: '_',
    
    // 命名空间
    defaultNS: 'translation',
    ns: ['translation'],
  });

export default i18n;
