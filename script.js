import { updateCanvasFormat } from './canvas.js';
import { updateTypographyStyle } from './typography.js';
import { generateTextPreview } from './structure.js';
import { showGeneratingOverlay, hideGeneratingOverlay } from './loading.js';

const generateBtn = document.getElementById('generate-btn');
const textInput = document.getElementById('text-input');
const structureSlider = document.getElementById('structure');
const fontSizeSlider = document.getElementById('fontsize');
const structureValue = document.getElementById('structure-value');

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
fontSizeSlider.addEventListener('input', () => {
  // Optional live display if needed:
  // document.getElementById('fontsize-value').textContent = fontSizeSlider.value;
});

fontSizeSlider.addEventListener('change', () => {
  const val = parseFloat(fontSizeSlider.value);
  const snapped = [1, 2, 3, 4].reduce((prev, curr) =>
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  );
  fontSizeSlider.value = snapped;
});

function generateArtwork() {
  const text = textInput.value.trim() || "Your text";
  const motionType = document.getElementById('motion').value;

  showGeneratingOverlay(); // start animation immediately

  const startTime = performance.now();

  updateCanvasFormat()
    .then(() => updateTypographyStyle())
    .then(() => {
      // Wait for next frame to ensure DOM/font updates take effect
      return new Promise(resolve => requestAnimationFrame(resolve));
    })
    .then(() => {
      const now = performance.now();
      const timeElapsed = now - startTime;
      const delay = Math.max(1000, timeElapsed + 3000); // wait at least 1s extra
      return new Promise(resolve => setTimeout(resolve, delay));
    })
    .then(() => {
      generateTextPreview(text, motionType);
      hideGeneratingOverlay();
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

    if (isOpen) {
      options.style.maxHeight = '0';
    } else {
      options.style.maxHeight = options.scrollHeight + 'px';
    }
  });

  options.querySelectorAll('li').forEach(option => {
    option.addEventListener('click', () => {
      options.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
      option.classList.add('selected');

      const hiddenInput = document.getElementById(type);
      if (hiddenInput) hiddenInput.value = option.dataset.value;

      options.classList.remove('open');
      options.style.maxHeight = '0';
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


// --- DOWNLOAD BUTTON ---
const downloadBtn = document.getElementById('download-btn');

downloadBtn.addEventListener('click', () => {
  const motionType = document.getElementById('motion').value;
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

  // Stop after given duration
  setTimeout(() => {
    recorder.stop();
  }, duration);
}