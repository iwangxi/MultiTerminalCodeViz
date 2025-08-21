import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { SimpleYouTubePlayer } from '../YouTubeAudioPlayer/SimpleYouTubePlayer';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import { captureFullScreen, copyScreenshotToClipboard, downloadScreenshot, generateScreenshotFilename } from '../../utils/screenshot';

interface ControlsPanelProps {
  terminalCount: number;
  onTerminalCountChange: (count: number) => void;
  onArrangeTerminals?: () => void;
  minTerminals?: number;
  maxTerminals?: number;
  catCount?: number;
  onRemoveAllCats?: () => void;
  onShowShortcuts?: () => void;
  onShowCustomEditor?: () => void;
}

export function ControlsPanel({
  terminalCount,
  onTerminalCountChange,
  onArrangeTerminals,
  minTerminals = 1,
  maxTerminals = 10000,
  catCount = 0,
  onRemoveAllCats,
  onShowShortcuts,
  onShowCustomEditor
}: ControlsPanelProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { themeName, setTheme, getThemeNames } = useTheme();
  const { t } = useTranslation();

  // 截图功能
  const [isCapturingFullScreen, setIsCapturingFullScreen] = useState(false);

  const handleFullScreenshot = async () => {
    if (isCapturingFullScreen) return;

    setIsCapturingFullScreen(true);
    try {
      const result = await captureFullScreen();
      if (result.success && result.blob) {
        const copied = await copyScreenshotToClipboard(result.blob);
        if (!copied) {
          // 如果复制失败，则下载
          downloadScreenshot(result.blob, generateScreenshotFilename('all-terminals'));
        }
        // 这里可以添加成功提示
        console.log('Full screenshot captured successfully');
      } else {
        console.error('Full screenshot failed:', result.error);
      }
    } catch (error) {
      console.error('Full screenshot error:', error);
    } finally {
      setIsCapturingFullScreen(false);
    }
  };

  // YouTube videos for the audio player
  const youtubeVideos = [
    { 
      id: 'jfKfPfyJRdk', 
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      title: 'lofi hip hop radio 📚 - beats to relax/study to'
    },
    {
      id: 'example2',
      url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
      title: 'lofi hip hop radio 🎵'
    }
  ];

  const handleIncrement = () => {
    if (terminalCount < maxTerminals) {
      onTerminalCountChange(terminalCount + 1);
    }
  };

  const handleIncrementByTen = () => {
    if (terminalCount < maxTerminals) {
      const newCount = Math.min(terminalCount + 10, maxTerminals);
      onTerminalCountChange(newCount);
    }
  };

  const handleDecrement = () => {
    if (terminalCount > minTerminals) {
      onTerminalCountChange(terminalCount - 1);
    }
  };

  const handleDecrementByTen = () => {
    if (terminalCount > minTerminals) {
      const newCount = Math.max(terminalCount - 10, minTerminals);
      onTerminalCountChange(newCount);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleThemeToggle = () => {
    const themes = getThemeNames();
    const currentIndex = themes.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <>
      {/* Main Controls Panel */}
      <div 
        className={`fixed top-4 left-4 bg-gray-800 border border-gray-600 rounded-lg shadow-lg transition-transform duration-300 ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ zIndex: 10001 }} // Ensure controls are always above cats and terminals
      >
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium text-sm">{t('controls.title')}</h3>
            <button
              onClick={toggleVisibility}
              className="text-gray-400 hover:text-white transition-colors border-0 p-1 bg-transparent"
              style={{ backgroundColor: 'transparent' }}
              aria-label={t('controls.hideControls')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Terminal Count Control */}
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={handleDecrementByTen}
              disabled={terminalCount <= minTerminals}
              className="w-8 h-8 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-bold transition-colors border-0 p-0"
              style={{ backgroundColor: terminalCount <= minTerminals ? '#4b5563' : '#dc2626' }}
              aria-label={t('controls.removeTenTerminals')}
            >
              -10
            </button>

            <button
              onClick={handleDecrement}
              disabled={terminalCount <= minTerminals}
              className="w-8 h-8 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-bold transition-colors border-0 p-0"
              style={{ backgroundColor: terminalCount <= minTerminals ? '#4b5563' : '#dc2626' }}
              aria-label={t('controls.removeTerminal')}
            >
              -
            </button>

            <span className="text-white font-mono text-sm min-w-[3rem] text-center">
              {t('terminal.count', { count: terminalCount })}
            </span>

            <button
              onClick={handleIncrement}
              disabled={terminalCount >= maxTerminals}
              className="w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-bold transition-colors border-0 p-0"
              style={{ backgroundColor: terminalCount >= maxTerminals ? '#4b5563' : '#059669' }}
              aria-label={t('controls.addTerminal')}
            >
              +
            </button>

            <button
              onClick={handleIncrementByTen}
              disabled={terminalCount >= maxTerminals}
              className="w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-bold transition-colors border-0 p-0"
              style={{ backgroundColor: terminalCount >= maxTerminals ? '#4b5563' : '#059669' }}
              aria-label={t('controls.addTenTerminals')}
            >
              +10
            </button>
          </div>

          {/* Arrange Button */}
          {onArrangeTerminals && (
            <button
              onClick={onArrangeTerminals}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 px-3 text-sm font-medium transition-colors border-0"
              style={{ backgroundColor: '#2563eb' }}
              aria-label={t('controls.arrangeTerminals')}
            >
              {t('controls.arrange')}
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={handleThemeToggle}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded py-2 px-3 text-sm font-medium transition-colors border-0"
            style={{ backgroundColor: '#7c3aed' }}
            aria-label={t('controls.switchTheme', { theme: themeName })}
          >
            {t('controls.theme')}: {themeName}
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Screenshot Button */}
          <button
            onClick={handleFullScreenshot}
            disabled={isCapturingFullScreen}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded py-2 px-3 text-sm font-medium transition-colors border-0 flex items-center justify-center space-x-2"
            style={{ backgroundColor: isCapturingFullScreen ? '#4b5563' : '#0891b2' }}
            aria-label={t('controls.screenshotAll')}
          >
            {isCapturingFullScreen ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Capturing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span>{t('controls.screenshotAll')}</span>
              </>
            )}
          </button>

          {/* Cat Controls (only show if cats exist) */}
          {catCount > 0 && onRemoveAllCats && (
            <div className="space-y-2">
              <div className="text-center">
                <span className="text-white font-mono text-xs">
                  {t('cats.count', { count: catCount })}
                </span>
              </div>
              <button
                onClick={onRemoveAllCats}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded py-2 px-3 text-sm font-medium transition-colors border-0"
                style={{ backgroundColor: '#ea580c' }}
                aria-label={t('controls.removeAllCats')}
              >
                {t('controls.removeCats')}
              </button>
            </div>
          )}

          {/* Custom Terminal Content Button */}
          {onShowCustomEditor && (
            <button
              onClick={onShowCustomEditor}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded py-2 px-3 text-sm font-medium transition-colors border-0 flex items-center justify-center space-x-2"
              style={{ backgroundColor: '#059669' }}
              aria-label={t('customTerminal.editCustomContent')}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <span>{t('customTerminal.editCustomContent')}</span>
            </button>
          )}

          {/* Keyboard Shortcuts Help Button */}
          {onShowShortcuts && (
            <button
              onClick={onShowShortcuts}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded py-2 px-3 text-sm font-medium transition-colors border-0 flex items-center justify-center space-x-2"
              style={{ backgroundColor: '#7c3aed' }}
              aria-label={t('shortcuts.showHelp')}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>{t('shortcuts.showHelp')}</span>
            </button>
          )}

          {/* YouTube Audio Player */}
          <div className="space-y-2">
            <SimpleYouTubePlayer videos={youtubeVideos} />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-600 text-center">
            <p className="text-gray-400 text-xs">
              {t('footer.madeWith')}{' '}
              <a
                href="https://x.com/gregkamradt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                Greg Kamradt
              </a>
              <br />
              <a
                href="https://github.com/gkamradt/MultiTerminalCodeViz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                {t('footer.code')}
              </a>
              {' '} • {' '}
              <a
                href="/typer"
                className="text-green-400 hover:text-green-300 transition-colors underline"
              >
                {t('footer.vibeTyper')}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Show Controls Button (appears when panel is hidden) */}
      {!isVisible && (
        <button
          onClick={toggleVisibility}
          className="fixed top-4 left-4 w-10 h-10 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg shadow-lg text-white transition-colors flex items-center justify-center p-0"
          style={{ backgroundColor: '#1f2937', zIndex: 10001 }}
          aria-label={t('controls.showControls')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </>
  );
} 