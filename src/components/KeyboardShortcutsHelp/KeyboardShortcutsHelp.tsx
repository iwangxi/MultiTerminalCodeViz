import { useTranslation } from 'react-i18next';
import type { KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';
import { formatShortcutKey } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isVisible: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsHelp({ shortcuts, isVisible, onClose }: KeyboardShortcutsHelpProps) {
  const { t } = useTranslation();

  if (!isVisible) return null;

  // 按功能分组快捷键
  const groupedShortcuts: ShortcutGroup[] = [
    {
      title: t('shortcuts.terminal'),
      shortcuts: shortcuts.filter(s => 
        s.description.includes('terminal') || 
        s.description.includes('Terminal') ||
        s.description.includes('终端')
      )
    },
    {
      title: t('shortcuts.layout'),
      shortcuts: shortcuts.filter(s => 
        s.description.includes('arrange') || 
        s.description.includes('layout') ||
        s.description.includes('排列') ||
        s.description.includes('布局')
      )
    },
    {
      title: t('shortcuts.screenshot'),
      shortcuts: shortcuts.filter(s => 
        s.description.includes('screenshot') || 
        s.description.includes('Screenshot') ||
        s.description.includes('截图')
      )
    },
    {
      title: t('shortcuts.display'),
      shortcuts: shortcuts.filter(s => 
        s.description.includes('theme') || 
        s.description.includes('controls') ||
        s.description.includes('language') ||
        s.description.includes('主题') ||
        s.description.includes('控制') ||
        s.description.includes('语言')
      )
    },
    {
      title: t('shortcuts.animation'),
      shortcuts: shortcuts.filter(s => 
        s.description.includes('animation') || 
        s.description.includes('pause') ||
        s.description.includes('speed') ||
        s.description.includes('动画') ||
        s.description.includes('暂停') ||
        s.description.includes('速度')
      )
    }
  ].filter(group => group.shortcuts.length > 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto border border-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{t('shortcuts.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={t('common.close')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupedShortcuts.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-400 border-b border-gray-600 pb-2">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-gray-300 text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-gray-700 text-white text-xs rounded border border-gray-600 font-mono">
                      {formatShortcutKey(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-600 text-center">
          <p className="text-gray-400 text-sm">
            {t('shortcuts.footer')}
          </p>
        </div>
      </div>
    </div>
  );
}
