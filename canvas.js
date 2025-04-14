const canvasFormatSelector = document.getElementById('canvas-format');
const canvasEl = document.getElementById('artwork-canvas');

export function updateCanvasFormat() {
  return new Promise(resolve => {
    const wrapper = canvasEl.parentElement; // ✅ .canvas wrapper
    wrapper.classList.remove('square', 'landscape', 'portrait');
    wrapper.classList.add(canvasFormatSelector.value);

    requestAnimationFrame(() => {
      const rect = wrapper.getBoundingClientRect();
      canvasEl.width = Math.floor(rect.width);
      canvasEl.height = Math.floor(rect.height);
      console.log('Canvas resized to:', canvasEl.width, canvasEl.height);
      resolve();
    });
  });
}