import html2canvas from 'html2canvas';

export interface ScreenshotOptions {
  scale?: number;
  backgroundColor?: string;
  useCORS?: boolean;
  allowTaint?: boolean;
  quality?: number;
}

export interface ScreenshotResult {
  success: boolean;
  blob?: Blob;
  dataUrl?: string;
  error?: string;
}

/**
 * 截图单个终端窗口
 */
export async function captureTerminal(
  terminalId: string, 
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  try {
    const terminalElement = document.getElementById(`terminal-${terminalId}`);
    if (!terminalElement) {
      return { success: false, error: 'Terminal not found' };
    }

    const canvas = await html2canvas(terminalElement, {
      scale: options.scale || 2,
      backgroundColor: options.backgroundColor || null,
      useCORS: options.useCORS || true,
      allowTaint: options.allowTaint || false,
      logging: false,
      ...options
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve({
            success: true,
            blob,
            dataUrl: canvas.toDataURL('image/png', options.quality || 0.9)
          });
        } else {
          resolve({ success: false, error: 'Failed to create blob' });
        }
      }, 'image/png', options.quality || 0.9);
    });
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 截图整个屏幕（所有终端）
 */
export async function captureFullScreen(
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  try {
    const appElement = document.querySelector('[data-screenshot-target="app"]') as HTMLElement;
    const targetElement = appElement || document.body;

    const canvas = await html2canvas(targetElement, {
      scale: options.scale || 1.5,
      backgroundColor: options.backgroundColor || null,
      useCORS: options.useCORS || true,
      allowTaint: options.allowTaint || false,
      logging: false,
      width: window.innerWidth,
      height: window.innerHeight,
      ...options
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve({
            success: true,
            blob,
            dataUrl: canvas.toDataURL('image/png', options.quality || 0.9)
          });
        } else {
          resolve({ success: false, error: 'Failed to create blob' });
        }
      }, 'image/png', options.quality || 0.9);
    });
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 下载截图文件
 */
export function downloadScreenshot(blob: Blob, filename: string = 'screenshot.png') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 复制截图到剪贴板
 */
export async function copyScreenshotToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    } else {
      // 降级处理：自动下载
      downloadScreenshot(blob, 'terminal-screenshot.png');
      return false;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // 降级处理：自动下载
    downloadScreenshot(blob, 'terminal-screenshot.png');
    return false;
  }
}

/**
 * 生成带时间戳的文件名
 */
export function generateScreenshotFilename(prefix: string = 'screenshot'): string {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, -5); // 移除毫秒和Z
  return `${prefix}_${timestamp}.png`;
}
