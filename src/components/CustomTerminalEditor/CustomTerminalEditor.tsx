import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TerminalLine } from '../../data/terminalOutputs';

interface CustomTerminalEditorProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (content: TerminalLine[]) => void;
  initialContent?: TerminalLine[];
}

interface CustomLine {
  id: string;
  text: string;
  color: string;
  type: 'command' | 'output' | 'error' | 'success' | 'info';
}

const colorOptions = [
  { value: 'primary', label: 'Primary', color: '#ffffff' },
  { value: 'success', label: 'Success', color: '#10b981' },
  { value: 'error', label: 'Error', color: '#ef4444' },
  { value: 'warning', label: 'Warning', color: '#f59e0b' },
  { value: 'info', label: 'Info', color: '#3b82f6' },
  { value: 'accent', label: 'Accent', color: '#8b5cf6' },
  { value: 'muted', label: 'Muted', color: '#6b7280' },
  { value: 'command', label: 'Command', color: '#06b6d4' }
];

// const lineTypeOptions = [
//   { value: 'command', label: 'Command' },
//   { value: 'output', label: 'Output' },
//   { value: 'error', label: 'Error' },
//   { value: 'success', label: 'Success' },
//   { value: 'info', label: 'Info' }
// ];

export function CustomTerminalEditor({ isVisible, onClose, onSave, initialContent = [] }: CustomTerminalEditorProps) {
  const { t } = useTranslation();
  
  // 将初始内容转换为编辑格式
  const [lines, setLines] = useState<CustomLine[]>(() => {
    if (initialContent.length > 0) {
      return initialContent.map((line, index) => ({
        id: `line-${index}`,
        text: line.text,
        color: line.color || 'primary',
        type: 'output' as const
      }));
    }
    return [
      { id: 'line-1', text: 'user@localhost:~$ ', color: 'command', type: 'command' },
      { id: 'line-2', text: 'Welcome to my custom terminal!', color: 'success', type: 'output' }
    ];
  });

  const [previewMode, setPreviewMode] = useState(false);

  if (!isVisible) return null;

  const addLine = () => {
    const newId = `line-${Date.now()}`;
    setLines([...lines, { id: newId, text: '', color: 'primary', type: 'output' }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(line => line.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof CustomLine, value: string) => {
    setLines(lines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const handleSave = () => {
    const terminalLines: TerminalLine[] = lines.map(line => ({
      text: line.text,
      color: line.color,
      delay: 100
    }));
    onSave(terminalLines);
    onClose();
  };

  const getColorPreview = (colorValue: string) => {
    const colorOption = colorOptions.find(opt => opt.value === colorValue);
    return colorOption?.color || '#ffffff';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-600 w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{t('customTerminal.title')}</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {previewMode ? t('customTerminal.edit') : t('customTerminal.preview')}
            </button>
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
        </div>

        {previewMode ? (
          /* Preview Mode */
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">{t('customTerminal.preview')}</h3>
            <div className="bg-black rounded-lg p-4 font-mono text-sm min-h-[300px]">
              {lines.map((line) => (
                <div key={line.id} className="mb-1">
                  <span style={{ color: getColorPreview(line.color) }}>
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{t('customTerminal.editLines')}</h3>
              <button
                onClick={addLine}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{t('customTerminal.addLine')}</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {lines.map((line, lineIndex) => (
                <div key={line.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Line {lineIndex + 1}</span>
                    <button
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length <= 1}
                      className="text-red-400 hover:text-red-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                      aria-label={t('customTerminal.removeLine')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {t('customTerminal.text')}
                      </label>
                      <input
                        type="text"
                        value={line.text}
                        onChange={(e) => updateLine(line.id, 'text', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                        placeholder={t('customTerminal.textPlaceholder')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {t('customTerminal.color')}
                      </label>
                      <select
                        value={line.color}
                        onChange={(e) => updateLine(line.id, 'color', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                      >
                        {colorOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="bg-black rounded p-2 font-mono text-sm">
                    <span style={{ color: getColorPreview(line.color) }}>
                      {line.text || t('customTerminal.textPlaceholder')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-600">
          <div className="text-sm text-gray-400">
            {t('customTerminal.linesCount', { count: lines.length })}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
