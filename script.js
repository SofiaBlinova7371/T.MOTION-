import { updateCanvasFormat } from './canvas.js';
import { updateTypographyStyle } from './typography.js';
import { generateTextPreview } from './structure.js';
import { showGeneratingOverlay, hideGeneratingOverlay } from './loading.js';

const generateBtn = document.getElementById('generate-btn');
const textInput = document.getElementById('text-input');
const structureSlider = document.getElementById('structure');
const fontSizeSlider = document.getElementById('fontsize');
const structureValue = document.getElementById('structure-value');
const motionToggle = document.getElementById('motion-toggle');
const motionInput = document.getElementById('motion');

// Auto-expand text input as user types
textInput.addEventListener('input', () => {
  textInput.style.height = 'auto';
  textInput.style.height = textInput.scrollHeight + 'px';
});

// STRUCTURE SLIDER: smooth drag + snap to [1, 50, 100]
structureSlider.addEventListener('input', () => {
  structureValue.textContent = structureSlider.value;
});

structureSlider.addEventListener('change', () => {
  const val = parseInt(structureSlider.value);
  const snapped = [1, 50, 100].reduce((prev, curr) =>
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  );
  structureSlider.value = snapped;
  structureValue.textContent = snapped;
});

// FONT SIZE SLIDER: smooth drag + snap to [1–5]
fontSizeSlider.addEventListener('change', () => {
  const val = parseFloat(fontSizeSlider.value);
  const snapped = [1, 2, 3, 4].reduce((prev, curr) =>
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  );
  fontSizeSlider.value = snapped;
});

function generateArtwork() {
  const text = textInput.value.trim() || "Your text";
  const motionType = motionInput.value;

  const canvas = document.querySelector('#artwork-canvas');
  const format = canvas.classList.contains('portrait') ? 'portrait'
                : canvas.classList.contains('landscape') ? 'landscape'
                : 'square';

  showGeneratingOverlay(format);

  const startTime = performance.now();

  updateCanvasFormat()
    .then(() => updateTypographyStyle())
    .then(() => new Promise(resolve => requestAnimationFrame(resolve)))
    .then(() => {
      const now = performance.now();
      const timeElapsed = now - startTime;
      const delay = Math.max(1000, timeElapsed + 3000);
      return new Promise(resolve => setTimeout(resolve, delay));
    })
    .then(() => {
      generateTextPreview(text, motionType);
      hideGeneratingOverlay(); // <— This now fades out
    });
}

generateBtn.addEventListener('click', generateArtwork);

// --- HANDLE FILTER DROPDOWNS ---
document.querySelectorAll('.filter').forEach(filter => {
  const label = filter.querySelector('label');
  const options = filter.querySelector('.filter-options');
  const type = filter.dataset.type;

  label.addEventListener('click', () => {
    const isOpen = options.classList.contains('open');
    options.classList.toggle('open');
    label.classList.toggle('open');
  
    const arrow = label.querySelector('.filter-arrow');
    arrow?.classList.toggle('rotated');
  
    options.style.maxHeight = isOpen ? '0' : options.scrollHeight + 'px';
  });

  options.querySelectorAll('li').forEach(option => {
    option.addEventListener('click', () => {
      options.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
      option.classList.add('selected');

      const hiddenInput = document.getElementById(type);
      if (hiddenInput) hiddenInput.value = option.dataset.value;    

      options.classList.remove('open');
      options.style.maxHeight = '0';
      label.classList.remove('open'); // remove label highlight
      const arrow = label.querySelector('.filter-arrow');
      arrow?.classList.remove('rotated');

      // ➤ Update canvas format instantly on selection
      if (type === 'canvas-format') {
        updateCanvasFormat();
      }
    });
  });
});

// --- STRUCTURE/FONT SLIDER TOGGLE ---
document.querySelectorAll('.filter-slider label').forEach(label => {
  label.addEventListener('click', () => {
    const wrapper = label.nextElementSibling;
    if (wrapper && wrapper.classList.contains('slider-wrapper')) {
      wrapper.classList.toggle('open');
    }
  });
});

// --- MOTION FILTER TOGGLE ---
motionToggle.addEventListener('click', () => {
  const current = motionToggle.dataset.state;
  const next = current === 'on' ? 'off' : 'on';

  motionToggle.dataset.state = next;
  motionInput.value = next === 'on' ? 'dynamic' : 'static';
});

// --- DOWNLOAD BUTTON ---
const downloadBtn = document.getElementById('download-btn');

downloadBtn.addEventListener('click', () => {
  const motionType = motionInput.value;
  const canvas = document.querySelector('.canvas');

  if (motionType === 'static') {
    html2canvas(canvas).then(canvasEl => {
      const link = document.createElement('a');
      link.download = 'static_artwork.png';
      link.href = canvasEl.toDataURL('image/png');
      link.click();
    });
  } else {
    recordCanvas(8000);
  }
});

// --- RECORD CANVAS (VIDEO EXPORT) ---
function recordCanvas(duration = 8000) {
  const fps = 60;
  const chunks = [];

  const canvasEl = document.getElementById('artwork-canvas');
  if (!canvasEl || !canvasEl.captureStream) {
    console.error('Canvas element or captureStream not available.');
    return;
  }

  const stream = canvasEl.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });

  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dynamic_artwork.webm';
    link.click();
  };

  recorder.start();
  setTimeout(() => recorder.stop(), duration);
}

// --- MOBILE MENU TOGGLE ---
const burgerIcon = document.querySelector('#burger-menu .burger-icon');
const mobileInputPanel = document.querySelector('.input-section.mobile-slide');

// Toggle panel on burger click
burgerIcon?.addEventListener('click', () => {
  const isOpen = mobileInputPanel?.classList.contains('open');
  mobileInputPanel?.classList.toggle('open');
  document.body.classList.toggle('menu-open', !isOpen);
});

// Close panel on generate
generateBtn?.addEventListener('click', () => {
  mobileInputPanel?.classList.remove('open');
  document.body.classList.remove('menu-open');
});