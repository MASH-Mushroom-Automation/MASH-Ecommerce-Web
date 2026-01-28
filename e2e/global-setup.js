// Global Playwright setup: polyfill missing web streams APIs required by Playwright runtime
module.exports = async () => {
  if (typeof global.TransformStream === 'undefined') {
    try {
      // Node 16+ exposes web streams under 'stream/web'
      const { TransformStream } = require('stream/web');
      global.TransformStream = TransformStream;
      console.log('[global-setup] Polyfilled TransformStream from stream/web');
    } catch (err) {
      // If polyfill fails, log and continue; tests will fail if not available
      console.warn('[global-setup] Could not polyfill TransformStream:', err && err.message);
    }
  }
};