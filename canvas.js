const canvasFormatSelector = document.getElementById('canvas-format');
const canvas = document.querySelector('.canvas');

export function updateCanvasFormat() {
  canvas.classList.remove('square', 'landscape', 'portrait');
  const selected = canvasFormatSelector.value;
  canvas.classList.add(selected);
}