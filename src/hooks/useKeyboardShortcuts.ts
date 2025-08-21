import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * 键盘快捷键Hook
 * 支持组合键和单键快捷键
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // 忽略在输入框中的按键
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    // 查找匹配的快捷键
    const matchedShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = (shortcut.ctrlKey || false) === event.ctrlKey;
      const altMatch = (shortcut.altKey || false) === event.altKey;
      const shiftMatch = (shortcut.shiftKey || false) === event.shiftKey;
      const metaMatch = (shortcut.metaKey || false) === event.metaKey;

      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
    });

    if (matchedShortcut) {
      if (matchedShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      matchedShortcut.action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return {
    shortcuts
  };
}

/**
 * 格式化快捷键显示文本
 */
export function formatShortcutKey(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.metaKey) parts.push('Cmd');
  
  // 特殊键名映射
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Enter': 'Enter',
    'Escape': 'Esc',
    'Backspace': 'Backspace',
    'Delete': 'Del',
    'Tab': 'Tab'
  };
  
  const keyName = keyMap[shortcut.key] || shortcut.key.toUpperCase();
  parts.push(keyName);
  
  return parts.join(' + ');
}

/**
 * 预定义的常用快捷键
 */
export const CommonShortcuts = {
  // 终端操作
  NEW_TERMINAL: { key: 'n', ctrlKey: true },
  CLOSE_TERMINAL: { key: 'w', ctrlKey: true },
  DUPLICATE_TERMINAL: { key: 'd', ctrlKey: true },
  
  // 布局操作
  ARRANGE_TERMINALS: { key: 'g', ctrlKey: true },
  TOGGLE_LAYOUT: { key: 'l', ctrlKey: true },
  
  // 主题和显示
  TOGGLE_THEME: { key: 't', ctrlKey: true },
  TOGGLE_CONTROLS: { key: 'h', ctrlKey: true },
  
  // 截图
  SCREENSHOT_ALL: { key: 's', ctrlKey: true },
  SCREENSHOT_TERMINAL: { key: 's', ctrlKey: true, shiftKey: true },
  
  // 动画控制
  PAUSE_ANIMATION: { key: ' ' }, // 空格键
  SPEED_UP: { key: 'ArrowUp' },
  SPEED_DOWN: { key: 'ArrowDown' },
  
  // 数量控制
  ADD_TERMINAL: { key: '=' },
  REMOVE_TERMINAL: { key: '-' },
  ADD_TEN_TERMINALS: { key: '=', shiftKey: true },
  REMOVE_TEN_TERMINALS: { key: '-', shiftKey: true },
  
  // 语言切换
  TOGGLE_LANGUAGE: { key: 'i', ctrlKey: true },
  
  // 帮助
  SHOW_HELP: { key: '?', shiftKey: true }
} as const;
