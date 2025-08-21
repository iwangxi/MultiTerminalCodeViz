import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { generateAsciiArt } from '../utils/asciiArt';

interface TextLine {
  id: string;
  text: string;
}

const PRESET_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Gray Dark', value: '#374151' },
  { name: 'Gray Light', value: '#9ca3af' },
];

export function AsciiTyper() {
  const { t } = useTranslation();
  const [lines, setLines] = useState<TextLine[]>([
    { id: '1', text: 'Gradient Text' }
  ]);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#22c55e');
  const [useTextGradient, setUseTextGradient] = useState(false);
  const [textGradientStart, setTextGradientStart] = useState('#22c55e');
  const [textGradientEnd, setTextGradientEnd] = useState('#3b82f6');
  const [useBackgroundGradient, setUseBackgroundGradient] = useState(false);
  const [backgroundGradientStart, setBackgroundGradientStart] = useState('#000000');
  const [backgroundGradientEnd, setBackgroundGradientEnd] = useState('#1f2937');
  const previewRef = useRef<HTMLDivElement>(null);

  const addNewLine = () => {
    const newId = Date.now().toString();
    setLines(prev => [...prev, { id: newId, text: '' }]);
  };

  const updateLineText = (id: string, newText: string) => {
    setLines(prev => prev.map(line => 
      line.id === id ? { ...line, text: newText } : line
    ));
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(prev => prev.filter(line => line.id !== id));
    }
  };

  const generatePreview = () => {
    if (lines.every(line => line.text.trim() === '')) {
      return ['', '', '', '', '', ''];
    }
    
    const textLines = lines
      .filter(line => line.text.trim() !== '')
      .map(line => line.text.toUpperCase());
    
    const result: string[] = [];
    
    for (const textLine of textLines) {
      const asciiLines = generateAsciiArt(textLine);
      result.push(...asciiLines);
      // Add spacing between lines
      if (textLine !== textLines[textLines.length - 1]) {
        result.push('');
      }
    }
    
    return result;
  };

  const copyToClipboard = () => {
    const asciiText = generatePreview().join('\n');
    navigator.clipboard.writeText(asciiText);
  };

  const copyImageToClipboard = async () => {
    if (!previewRef.current) return;

    try {
      // Use html2canvas to capture the preview area
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: backgroundColor,
        scale: 2, // Higher resolution
        useCORS: true,
      });

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
        } catch (error) {
          console.error('Failed to copy image to clipboard:', error);
          // Fallback: create download link
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ascii-art.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to capture image:', error);
    }
  };

  return (
    <div
      className="h-screen overflow-y-auto p-8 transition-colors duration-300"
      style={{ backgroundColor }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: textColor }}>
            {t('asciiTyper.title')}
          </h1>
          <p className="text-lg opacity-80" style={{ color: textColor }}>
            Type text and see it converted to ASCII art in real-time
          </p>
        </div>

        {/* ASCII Preview - Hero Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold" style={{ color: textColor }}>
              ASCII Preview
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                Copy Text
              </button>
              <button
                onClick={copyImageToClipboard}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
              >
                Copy Image
              </button>
            </div>
          </div>
          
          <div 
            ref={previewRef}
            className="p-6 rounded-lg border-2 font-mono text-xs leading-tight overflow-auto"
            style={{ 
              background: useBackgroundGradient 
                ? `linear-gradient(to right, ${backgroundGradientStart}, ${backgroundGradientEnd})`
                : backgroundColor,
              borderColor: useTextGradient ? textGradientStart : textColor
            }}
          >
            {useTextGradient ? (
              <pre style={{
                background: `linear-gradient(to right, ${textGradientStart}, ${textGradientEnd}) text`,
                // backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent'
              }}>
                {generatePreview().map((line, index) => (
                  <div key={index} className="whitespace-pre">
                    {line || '\u00A0'}
                  </div>
                ))}
              </pre>
            ) : (
              <pre style={{ color: textColor }}>
                {generatePreview().map((line, index) => (
                  <div key={index} className="whitespace-pre">
                    {line || '\u00A0'}
                  </div>
                ))}
              </pre>
            )}
          </div>
        </div>

        {/* Text Input Lines */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold" style={{ color: textColor }}>
              Text Lines
            </h3>
            <button
              onClick={addNewLine}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Add Line
            </button>
          </div>
          
          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={line.id} className="flex gap-3 items-center">
                <span className="text-sm font-mono w-8" style={{ color: textColor }}>
                  {index + 1}:
                </span>
                <input
                  type="text"
                  value={line.text}
                  onChange={(e) => updateLineText(line.id, e.target.value)}
                  placeholder="Type your text here..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {lines.length > 1 && (
                  <button
                    onClick={() => removeLine(line.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Color Controls */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Background Color */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold" style={{ color: textColor }}>
                Background Color
              </h3>
              <label className="flex items-center gap-2 text-sm" style={{ color: textColor }}>
                <input
                  type="checkbox"
                  checked={useBackgroundGradient}
                  onChange={(e) => setUseBackgroundGradient(e.target.checked)}
                  className="rounded"
                />
                Use Gradient
              </label>
            </div>
            
            {!useBackgroundGradient ? (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setBackgroundColor(color.value)}
                      className={`w-12 h-12 rounded border-2 transition-all hover:scale-110 ${
                        backgroundColor === color.value ? 'border-white border-4' : 'border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="mt-2 w-full h-8 rounded cursor-pointer"
                />
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-2" style={{ color: textColor }}>
                    Start Color (Left)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setBackgroundGradientStart(color.value)}
                        className={`w-12 h-12 rounded border-2 transition-all hover:scale-110 ${
                          backgroundGradientStart === color.value ? 'border-white border-4' : 'border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={backgroundGradientStart}
                    onChange={(e) => setBackgroundGradientStart(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: textColor }}>
                    End Color (Right)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setBackgroundGradientEnd(color.value)}
                        className={`w-12 h-12 rounded border-2 transition-all hover:scale-110 ${
                          backgroundGradientEnd === color.value ? 'border-white border-4' : 'border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={backgroundGradientEnd}
                    onChange={(e) => setBackgroundGradientEnd(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Text Color */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold" style={{ color: textColor }}>
                Text Color
              </h3>
              <label className="flex items-center gap-2 text-sm" style={{ color: textColor }}>
                <input
                  type="checkbox"
                  checked={useTextGradient}
                  onChange={(e) => setUseTextGradient(e.target.checked)}
                  className="rounded"
                />
                Use Gradient
              </label>
            </div>
            
            {!useTextGradient ? (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setTextColor(color.value)}
                      className={`w-12 h-12 rounded border-2 transition-all hover:scale-110 ${
                        textColor === color.value ? 'border-white border-4' : 'border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="mt-2 w-full h-8 rounded cursor-pointer"
                />
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-2" style={{ color: textColor }}>
                    Start Color (Left)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setTextGradientStart(color.value)}
                        className={`w-12 h-12 rounded border-2 transition-all hover:scale-110 ${
                          textGradientStart === color.value ? 'border-white border-4' : 'border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={textGradientStart}
                    onChange={(e) => setTextGradientStart(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: textColor }}>
                    End Color (Right)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setTextGradientEnd(color.value)}
                        className={`w-12 h-12 rounded border-2 transition-all hover:scale-110 ${
                          textGradientEnd === color.value ? 'border-white border-4' : 'border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={textGradientEnd}
                    onChange={(e) => setTextGradientEnd(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm opacity-70" style={{ color: textColor }}>
          <p>• Type in the text fields above to see ASCII art generated in real-time</p>
          <p>• Use the + button to add new lines</p>
          <p>• Customize colors using the color pickers or preset swatches</p>
          <p>• Copy the generated ASCII art as text or image to use elsewhere</p>
        </div>
      </div>
    </div>
  );
}