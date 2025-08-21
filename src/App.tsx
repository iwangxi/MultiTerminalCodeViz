import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TerminalWindow } from './components/TerminalWindow/TerminalWindow';
import { ControlsPanel } from './components/ControlsPanel/ControlsPanel';
import { BouncyCat } from './components/BouncyCat/BouncyCat';
import { AsciiTyper } from './pages/AsciiTyper';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp/KeyboardShortcutsHelp';
import { CustomTerminalEditor } from './components/CustomTerminalEditor/CustomTerminalEditor';
import { useState } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { useKeyboardShortcuts, CommonShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './contexts/ThemeContext';
import { useCustomTerminalContent } from './hooks/useCustomTerminalContent';
import { captureFullScreen, copyScreenshotToClipboard, downloadScreenshot, generateScreenshotFilename } from './utils/screenshot';
import type { TerminalLine } from './data/terminalOutputs';

interface Terminal {
  id: string;
  position: { x: number; y: number };
  zIndex: number;
}

function AppContent() {
  const { t, i18n } = useTranslation();
  const { themeName, setTheme, getThemeNames } = useTheme();

  // Generate random position for a new terminal within safe bounds
  const generateRandomPosition = () => {
    const padding = 100; // Extra padding to avoid edge cases
    const maxX = Math.max(50, window.innerWidth - 200 - padding);
    const maxY = Math.max(50, window.innerHeight - 150 - padding);

    const position = {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY),
    };

    return position;
  };

  // Hold all terminals directly in state so changes trigger re-renders
  const [highestZIndex, setHighestZIndex] = useState(1);
  
  // Separate actual count from rendered terminals for performance
  const [actualTerminalCount, setActualTerminalCount] = useState(1);
  const [nextTerminalId, setNextTerminalId] = useState(1);
  
  // Keep only the most recent N terminals rendered (circular buffer approach)
  // Reduce rendered terminals when performance is struggling
  const maxRenderedTerminals = actualTerminalCount > 1000 ? 40 : 80;
  
  const [terminals, setTerminals] = useState<Terminal[]>(() => [
    {
      id: 'terminal-0',
      position: generateRandomPosition(),
      zIndex: 1,
    },
  ]);

  // Bouncy cats state
  const [cats, setCats] = useState<string[]>([]);

  // 键盘快捷键帮助状态
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // 自定义终端内容状态
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [customTerminalContent, setCustomTerminalContent] = useState<TerminalLine[] | null>(null);

  // 动画暂停状态
  const [animationsPaused, setAnimationsPaused] = useState(false);

  // 自定义终端内容管理
  const { createCustomContent } = useCustomTerminalContent();

  // 截图功能
  const handleFullScreenshot = async () => {
    try {
      const result = await captureFullScreen();
      if (result.success && result.blob) {
        const copied = await copyScreenshotToClipboard(result.blob);
        if (!copied) {
          downloadScreenshot(result.blob, generateScreenshotFilename('all-terminals'));
        }
      }
    } catch (error) {
      console.error('Screenshot error:', error);
    }
  };

  // 主题切换
  const handleThemeToggle = () => {
    const themeNames = getThemeNames();
    const currentIndex = themeNames.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    setTheme(themeNames[nextIndex]);
  };

  // 语言切换
  const handleLanguageToggle = () => {
    const currentLang = i18n.language;
    const nextLang = currentLang === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  // 自定义终端内容处理
  const handleSaveCustomContent = (content: TerminalLine[]) => {
    const customContent = createCustomContent(`Custom Content ${Date.now()}`, content);
    setCustomTerminalContent(content);
    console.log('Custom content saved:', customContent);
  };

  
  // Use actual count for cats, not rendered count - allow up to 1000 cats
  // const expectedCatCount = Math.min(Math.floor(actualTerminalCount / 5), 1000);

  const handleTerminalCountChange = (count: number) => {
    // Update the actual terminal count (can go to 10,000+)
    setActualTerminalCount(count);
    
    setTerminals((prev) => {
      let updated = [...prev];
      let newZ = highestZIndex;
      let newNextId = nextTerminalId;

      // Add new terminals if needed
      if (count > actualTerminalCount) {
        const terminalsToAdd = count - actualTerminalCount;
        for (let i = 0; i < terminalsToAdd; i++) {
          newZ += 1;
          const newTerminal = {
            id: `terminal-${newNextId}`,
            position: generateRandomPosition(),
            zIndex: newZ,
          };
          updated.push(newTerminal);
          newNextId += 1;
          
          // If we exceed max rendered terminals, remove the oldest ones
          if (updated.length > maxRenderedTerminals) {
            updated = updated.slice(-maxRenderedTerminals);
          }
        }
      } else if (count < actualTerminalCount) {
        // Remove terminals from the end
        const terminalsToRemove = actualTerminalCount - count;
        updated = updated.slice(0, Math.max(0, updated.length - terminalsToRemove));
      }

      setHighestZIndex(newZ);
      setNextTerminalId(newNextId);
      
      // Update cats based on new actual terminal count (max 1000 cats)
      const newExpectedCatCount = Math.min(Math.floor(count / 5), 1000);
      setCats(prevCats => {
        if (newExpectedCatCount > prevCats.length) {
          // Add new cats
          const newCats = [...prevCats];
          for (let i = prevCats.length; i < newExpectedCatCount; i++) {
            newCats.push(`cat-${Date.now()}-${i}`);
          }
          return newCats;
        } else if (newExpectedCatCount < prevCats.length) {
          // Remove excess cats if terminals are removed
          return prevCats.slice(0, newExpectedCatCount);
        }
        return prevCats;
      });
      
      return updated;
    });
  };

  const handleTerminalClose = (terminalId: string) => {
    // Decrease actual terminal count
    const newCount = Math.max(1, actualTerminalCount - 1);
    setActualTerminalCount(newCount);
    
    setTerminals((prev) => {
      const updated = prev.filter(terminal => terminal.id !== terminalId);
      
      // Update cats when terminal count changes (max 1000 cats)
      const newExpectedCatCount = Math.min(Math.floor(newCount / 5), 1000);
      setCats(prevCats => prevCats.slice(0, newExpectedCatCount));
      
      return updated;
    });
  };

  const handleRemoveAllCats = () => {
    setCats([]);
  };

  const handlePositionChange = (terminalId: string, position: { x: number; y: number }) => {
    setTerminals((prev) =>
      prev.map((terminal) =>
        terminal.id === terminalId
          ? { ...terminal, position }
          : terminal
      )
    );
  };

  const handleFocus = (terminalId: string) => {
    // Cap z-index to prevent conflicts with controls (controls are at 10001)
    const newZ = Math.min(highestZIndex + 1, 9999);
    setHighestZIndex(newZ);
    setTerminals((prev) =>
      prev.map((terminal) =>
        terminal.id === terminalId ? { ...terminal, zIndex: newZ } : terminal
      )
    );
  };

  const handleArrangeTerminals = () => {
    setTerminals((prev) => {
      const terminalWidth = 320; // Default terminal width + some padding
      const terminalHeight = 280; // Default terminal height + some padding
      const padding = 20;
      const layerOffset = 15; // Offset between layers
      
      // Calculate viewport constraints
      const availableWidth = window.innerWidth - 200; // Account for controls panel
      const availableHeight = window.innerHeight - 100; // Account for some top/bottom padding
      
      const terminalsPerRow = Math.floor(availableWidth / terminalWidth);
      const maxRows = Math.floor(availableHeight / terminalHeight);
      const terminalsPerLayer = terminalsPerRow * maxRows;
      
      return prev.map((terminal, index) => {
        // Determine which layer this terminal belongs to
        const layer = Math.floor(index / terminalsPerLayer);
        const indexInLayer = index % terminalsPerLayer;
        
        const row = Math.floor(indexInLayer / terminalsPerRow);
        const col = indexInLayer % terminalsPerRow;
        
        // Checkerboard offset - alternate starting positions
        const offsetX = (row % 2) * (terminalWidth / 2);
        
        // Layer offset - each layer is slightly behind and offset
        const layerOffsetX = layer * layerOffset;
        const layerOffsetY = layer * layerOffset;
        
        const x = col * terminalWidth + padding + offsetX + layerOffsetX + 150; // Extra offset for controls
        const y = row * terminalHeight + padding + layerOffsetY + 50;
        
        return {
          ...terminal,
          position: { x, y }
        };
      });
    });
  };

  // 定义键盘快捷键
  const shortcuts = [
    {
      ...CommonShortcuts.NEW_TERMINAL,
      action: () => handleTerminalCountChange(actualTerminalCount + 1),
      description: t('shortcuts.newTerminal')
    },
    {
      ...CommonShortcuts.ADD_TERMINAL,
      action: () => handleTerminalCountChange(actualTerminalCount + 1),
      description: t('shortcuts.addTerminal')
    },
    {
      ...CommonShortcuts.REMOVE_TERMINAL,
      action: () => handleTerminalCountChange(Math.max(1, actualTerminalCount - 1)),
      description: t('shortcuts.removeTerminal')
    },
    {
      ...CommonShortcuts.ADD_TEN_TERMINALS,
      action: () => handleTerminalCountChange(actualTerminalCount + 10),
      description: t('shortcuts.addTenTerminals')
    },
    {
      ...CommonShortcuts.REMOVE_TEN_TERMINALS,
      action: () => handleTerminalCountChange(Math.max(1, actualTerminalCount - 10)),
      description: t('shortcuts.removeTenTerminals')
    },
    {
      ...CommonShortcuts.ARRANGE_TERMINALS,
      action: handleArrangeTerminals,
      description: t('shortcuts.arrangeTerminals')
    },
    {
      ...CommonShortcuts.TOGGLE_THEME,
      action: handleThemeToggle,
      description: t('shortcuts.toggleTheme')
    },
    {
      ...CommonShortcuts.SCREENSHOT_ALL,
      action: handleFullScreenshot,
      description: t('shortcuts.screenshotAll')
    },
    {
      ...CommonShortcuts.TOGGLE_LANGUAGE,
      action: handleLanguageToggle,
      description: t('shortcuts.toggleLanguage')
    },
    {
      ...CommonShortcuts.SHOW_HELP,
      action: () => setShowShortcutsHelp(!showShortcutsHelp),
      description: t('shortcuts.showHelp')
    },
    {
      ...CommonShortcuts.PAUSE_ANIMATION,
      action: () => setAnimationsPaused(!animationsPaused),
      description: t('shortcuts.pauseAnimation')
    }
  ];

  // 启用键盘快捷键
  useKeyboardShortcuts({ shortcuts });

  return (
    <div
      className="text-white overflow-hidden relative"
      data-screenshot-target="app"
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundImage: 'url("sonomaBackground.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Controls Panel - positioned absolutely in top-left */}
      <ControlsPanel
        terminalCount={actualTerminalCount}
        onTerminalCountChange={handleTerminalCountChange}
        onArrangeTerminals={handleArrangeTerminals}
        catCount={cats.length}
        onRemoveAllCats={handleRemoveAllCats}
        onShowShortcuts={() => setShowShortcutsHelp(true)}
        onShowCustomEditor={() => setShowCustomEditor(true)}
      />

      {/* Terminal Container */}
      <div 
        className="relative" 
        style={{ 
          width: '100vw', 
          height: '100vh', 
          margin: 0, 
          padding: 0 
        }}
      >
        {terminals.map((terminal, index) => (
          <TerminalWindow
            key={terminal.id}
            id={terminal.id}
            title={t('terminal.title', { number: index + 1 })}
            initialPosition={terminal.position}
            zIndex={terminal.zIndex}
            onFocus={handleFocus}
            onClose={() => handleTerminalClose(terminal.id)}
            onPositionChange={handlePositionChange}
            totalTerminalCount={actualTerminalCount}
          />
        ))}
      </div>

      {/* Bouncy Cats - render above everything */}
      {cats.map((catId) => (
        <BouncyCat
          key={catId}
          id={catId}
          totalCatCount={cats.length}
        />
      ))}

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        shortcuts={shortcuts}
        isVisible={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />

      {/* Custom Terminal Editor */}
      <CustomTerminalEditor
        isVisible={showCustomEditor}
        onClose={() => setShowCustomEditor(false)}
        onSave={handleSaveCustomContent}
        initialContent={customTerminalContent || undefined}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router basename="/MultiTerminalCodeViz">
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/typer" element={<AsciiTyper />} />
          </Routes>
          <Analytics />
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
