import { generateMoodPalette } from './mood.js';
import { applyMotion } from './motion.js';

const structureSlider = document.getElementById('structure');
const canvas = document.querySelector('.canvas');
const moodSelector = document.getElementById('mood');

function breakParagraphIntoLines(paragraph, maxChars = 60) {
  const words = paragraph.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxChars) {
      currentLine += word + ' ';
    } else {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    }
  }
  if (currentLine.trim() !== '') {
    lines.push(currentLine.trim());
  }

  return lines;
}

export function generateTextPreview(text) {
  const oldCopies = canvas.querySelectorAll('.text-copy');
  oldCopies.forEach(el => el.remove());

  const structureValue = parseInt(structureSlider.value);
  const chaosRatio = structureValue / 100;

  const selectedMood = moodSelector.value;
  const palette = generateMoodPalette(selectedMood);
  canvas.style.backgroundColor = palette[0];

  const splitParagraphs = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  let paragraphs = [];

  splitParagraphs.forEach(p => {
    const lines = breakParagraphIntoLines(p, 60);
    const lineCount = lines.length;

    lines.forEach(line => {
      paragraphs.push({
        text: line,
        weight: 1 / lineCount
      });
    });
  });

  const allGroups = [];

  paragraphs.forEach(({ text: paragraph, weight }, pIndex) => {
    const paragraphCount = paragraphs.length;
    const maxGroups = paragraphCount <= 2 ? 11 : 4;
    const minGroups = paragraphCount <= 2 ? 6 : 2;
    const rawGroupCount = Math.random() * (maxGroups - minGroups) + minGroups;
    const numGroups = Math.max(1, Math.floor(rawGroupCount * weight));

    for (let g = 0; g < numGroups; g++) {
      allGroups.push({
        text: paragraph,
        index: allGroups.length,
        size: Math.floor(Math.random() * 25 + 10),
        transform: ['none', 'uppercase', 'lowercase', 'capitalize'][Math.floor(Math.random() * 4)],
        spacing: chaosRatio < 0.3 ? 'normal' : (Math.random() * 0.2).toFixed(2) + 'em',
        direction: chaosRatio < 0.15 ? 'horizontal' : (Math.random() > 0.5 ? 'vertical' : 'horizontal'),
        color: palette[(pIndex + g + 1) % palette.length]
      });
    }
  });

  const totalGroups = allGroups.length;
  const groupPositions = [];

  allGroups.forEach((group, i) => {
    let baseTop, baseLeft;

    if (chaosRatio < 0.25) {
      const cols = 3;
      const rows = Math.ceil(totalGroups / cols);
      const col = i % cols;
      const row = Math.floor(i / cols);
      const colWidth = 100 / cols;
      const rowHeight = 100 / rows;
      baseLeft = col * colWidth + colWidth * 0.1;
      baseTop = row * rowHeight + rowHeight * 0.1;
    } else {
      let collision, attempts = 0;
      const spacingThreshold = chaosRatio < 0.6 ? 8 : 5;

      do {
        baseTop = Math.random() * 60;
        baseLeft = Math.random() * 60;
        collision = groupPositions.some(pos => {
          const dist = Math.hypot(pos.left - baseLeft, pos.top - baseTop);
          return dist < spacingThreshold;
        });
        attempts++;
      } while (collision && attempts < 100);

      if (attempts >= 100) {
        baseTop = Math.random() * 60;
        baseLeft = Math.random() * 60;
      }
    }

    groupPositions.push({ top: baseTop, left: baseLeft });

    const paragraph = group.text;
    const groupCopies = Math.floor(Math.max(4, Math.floor(200 / paragraph.length)) + Math.random() * 5);
    const groupSize = group.size;
    const groupColor = group.color;

    let cumulativeOffset = 0;
    let rowOffset = 0;
    const maxRowLength = canvas.offsetWidth * 0.8;

    for (let c = 0; c < groupCopies; c++) {
      const el = document.createElement('p');
      el.classList.add('text-copy');
      el.innerText = paragraph;

      el.style.position = 'absolute';
      el.style.fontFamily = 'inherit';
      el.style.fontSize = `${groupSize}px`;
      el.style.textTransform = group.transform;
      el.style.letterSpacing = group.spacing;
      el.style.color = groupColor;
      el.style.opacity = 0.9;
      el.style.whiteSpace = 'normal';
      el.style.wordBreak = 'break-word';
      el.style.maxWidth = '80%';
      el.style.visibility = 'hidden';
      canvas.appendChild(el);

      let offsetTop = baseTop;
      let offsetLeft = baseLeft;

      if (chaosRatio < 0.15) {
        const elWidth = el.offsetWidth;
        const spacing = 10;
        offsetLeft += cumulativeOffset;
        cumulativeOffset += (elWidth + spacing) / canvas.offsetWidth * 100;

        if (cumulativeOffset * canvas.offsetWidth / 100 > maxRowLength) {
          rowOffset += groupSize * 1.5;
          offsetTop += rowOffset / canvas.offsetHeight * 100;
          cumulativeOffset = 0;
        }
      } else if (chaosRatio < 0.6) {
        const spacingFactor = chaosRatio < 0.3 ? 1.2 : 0.8;
        if (group.direction === 'vertical') {
          const elHeight = el.offsetHeight;
          offsetTop += cumulativeOffset;
          cumulativeOffset += elHeight * spacingFactor / canvas.offsetHeight * 100;
        } else {
          const elWidth = el.offsetWidth;
          offsetLeft += cumulativeOffset;
          cumulativeOffset += elWidth * spacingFactor / canvas.offsetWidth * 100;

          if (cumulativeOffset * canvas.offsetWidth / 100 > maxRowLength) {
            rowOffset += groupSize * 1.5;
            offsetTop += rowOffset / canvas.offsetHeight * 100;
            cumulativeOffset = 0;
          }
        }
      } else {
        offsetTop += Math.random() * 30 - 15;
        offsetLeft += Math.random() * 30 - 15;
      }

      el.style.top = `${offsetTop}%`;
      el.style.left = `${offsetLeft}%`;
      el.style.visibility = 'visible';
    }
  });

  applyMotion(); // apply animations
}