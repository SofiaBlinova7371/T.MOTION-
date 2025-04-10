import { updateCanvasFormat } from './canvas.js';
import { updateTypographyStyle } from './typography.js';
import { generateTextPreview } from './structure.js';

const generateBtn = document.getElementById('generate-btn');
const textInput = document.getElementById('text-input');
const structureSlider = document.getElementById('structure');
const structureValue = document.getElementById('structure-value');

// --- GENERATE TEXT ---
function generateArtwork() {
  updateCanvasFormat();
  updateTypographyStyle();

  const text = textInput.value.trim() || "Your text";
  const motionType = document.getElementById('motion').value;

  generateTextPreview(text, motionType);
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

// --- STRUCTURE SLIDER TOGGLE ---
const structureLabel = document.querySelector('.filter-slider label');
const sliderWrapper = document.querySelector('.slider-wrapper');

structureLabel.addEventListener('click', () => {
  sliderWrapper.classList.toggle('open');
});

structureSlider.addEventListener('input', () => {
  structureValue.textContent = structureSlider.value;
});

structureSlider.addEventListener('change', () => {
  const val = parseInt(structureSlider.value);
  const snapped = [0, 50, 100].reduce((prev, curr) =>
    Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
  );
  structureSlider.value = snapped;
  structureValue.textContent = snapped;
});