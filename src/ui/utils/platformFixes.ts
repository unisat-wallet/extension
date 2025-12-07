/**
 * Platform Fixes
 * Handles platform-specific rendering issues
 */
import browser from '@/background/webapi/browser';

/**
 * Apply fix for Chrome extension render problem on external/secondary monitors
 * This issue occurs when the popup is opened on a secondary monitor on macOS
 */
export function applyExternalMonitorFix(): void {
  // Check if popup was opened on a secondary monitor
  const isExternalMonitor =
    window.screenLeft < 0 ||
    window.screenTop < 0 ||
    window.screenLeft > window.screen.width ||
    window.screenTop > window.screen.height;

  if (!isExternalMonitor) {
    return;
  }

  browser.runtime.getPlatformInfo(function (info) {
    if (info.os === 'mac') {
      const fontFaceSheet = new CSSStyleSheet();

      // Add redraw animation keyframes
      fontFaceSheet.insertRule(`
        @keyframes redraw {
          0% {
            opacity: 1;
          }
          100% {
            opacity: .99;
          }
        }
      `);

      // Apply animation to html element
      fontFaceSheet.insertRule(`
        html {
          animation: redraw 1s linear infinite;
        }
      `);

      (document as any).adoptedStyleSheets = [...(document as any).adoptedStyleSheets, fontFaceSheet];
    }
  });
}
