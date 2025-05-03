const canvasFormatSelector = document.getElementById('canvas-format');
const canvasEl = document.getElementById('artwork-canvas');

export function updateCanvasFormat() {
  return new Promise(resolve => {
    const format = canvasFormatSelector.value;

    // Remove old format classes
    canvasEl.classList.remove('square', 'landscape', 'portrait');
    canvasEl.classList.add(format);

    // Resize canvas
    requestAnimationFrame(() => {
      const rect = canvasEl.getBoundingClientRect();
      canvasEl.width = Math.floor(rect.width);
      canvasEl.height = Math.floor(rect.height);
      console.log('Canvas resized to:', canvasEl.width, canvasEl.height);
      resolve();
    });
  });
}