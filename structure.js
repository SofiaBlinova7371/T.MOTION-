
import { generateMoodPalette } from './mood.js';
import { currentFont } from './typography.js';

const structureSlider = document.getElementById('structure');
const moodSelector = document.getElementById('mood');
const canvas = document.getElementById('artwork-canvas');
const ctx = canvas.getContext('2d');

let animationFrameId = null;
let drawData = [];
let currentPalette = null;

function remToPx(rem) {
  const baseFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return rem * baseFontSize;
}

function getResponsiveFontSize(minRem, maxRem) {
  const screenFactor = Math.min(window.innerWidth, 900) / 900;
  const clampedFactor = Math.max(0.5, screenFactor);
  const rem = minRem + (maxRem - minRem) * Math.random();
  return remToPx(rem * clampedFactor);
}

export function generateTextPreview(text, motionType) {
  cancelAnimationFrame(animationFrameId);
  drawData = [];

  const structureValue = parseInt(structureSlider.value);
  const mood = moodSelector.value;
  currentPalette = generateMoodPalette(mood);
  const bg = currentPalette[0];
  const colors = currentPalette.slice(1);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  let layoutType = 'structured';
  if (structureValue === 50) layoutType = 'modular';
  else if (structureValue === 100) layoutType = 'chaotic';

  const paragraphs = text
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .flatMap(p => breakParagraphIntoLines(p, 50))
    .map((line, i, arr) => ({
      text: line,
      weight: 1 / arr.length
    }));

  const allGroups = [];
  paragraphs.forEach(({ text: paragraph, weight }, pIndex) => {
    const baseMin = 1.2;
    const baseMax = 2.4;
    const layoutMultiplier = layoutType === 'chaotic' ? 1.4 : layoutType === 'modular' ? 1.2 : 1;
    const totalTargetGroups = Math.floor((Math.random() * (baseMax - baseMin) + baseMin) * layoutMultiplier * 5);
    const weightAdjusted = weight * totalTargetGroups;
    const numGroups = Math.max(1, Math.floor(weightAdjusted + Math.random()));

    for (let g = 0; g < numGroups; g++) {
      let fontSize = layoutType === 'structured' ? getResponsiveFontSize(1.4, 3.2)
                   : layoutType === 'modular' ? getResponsiveFontSize(1.2, 4)
                   : getResponsiveFontSize(1, 5);

      allGroups.push({
        text: paragraph,
        size: fontSize,
        transform: ['none', 'uppercase', 'lowercase', 'capitalize'][Math.floor(Math.random() * 4)],
        color: colors[(pIndex + g + 1) % colors.length]
      });
    }
  });

  const groupPositions = [];

  let sharedMotion = null;

  allGroups.forEach((group, i) => {
    const fontSize = group.size;
    const text = applyTextTransform(group.text, group.transform);
    ctx.font = `${fontSize}px '${currentFont}', sans-serif`;

    const maxTextWidth = canvas.width * 0.45;
    const lines = wrapLine(text, fontSize, maxTextWidth);

    let baseX, baseY;
    let collision, attempts = 0;
    const spacingThreshold = layoutType === 'chaotic' ? 5 : 8;

    do {
      baseX = Math.random() * (canvas.width - 200);
      baseY = Math.random() * (canvas.height - 100);
      collision = groupPositions.some(pos => {
        const dist = Math.hypot(pos.x - baseX, pos.y - baseY);
        return dist < spacingThreshold * 10;
      });
      attempts++;
    } while (collision && attempts < 100);

    groupPositions.push({ x: baseX, y: baseY });

    const textLength = group.text.length;
    const duplicates = Math.floor(Math.max(4, Math.min(15, 200 / textLength)) + Math.random() * 3);

    const direction =
      layoutType === 'chaotic' ? 'cloud'
      : layoutType === 'structured' ? ['horizontal', 'vertical'][i % 2]
      : ['horizontal', 'vertical', 'diagonal', 'diagonal-zigzag'][Math.floor(Math.random() * 4)];

    const diagonalRight = Math.random() > 0.5;
    const baseAngle = diagonalRight ? Math.PI / 4 : -Math.PI / 4;

    let groupMotion = {
      dx: 0, dy: 0, rotation: 0, rotationSpeed: 0, bounce: false,
      dynamicScale: false, scaleSpeed: 0, scaleAmplitude: 0, scalePhase: 0
    };

    function getRandomMotion() {
      const type = ['flicker', 'rotation', 'scale', 'blur'][Math.floor(Math.random() * 4)];
      const motion = {};
    
      if (type === 'rotation') {
        motion.rotationSpeed = (Math.random() - 0.5) * 0.05;
      }
    
      if (type === 'scale') {
        motion.dynamicScale = true;
        motion.scaleSpeed = 2 + Math.random() * 3;
        motion.scaleAmplitude = 0.2 + Math.random() * 0.3;
        motion.scalePhase = Math.random() * Math.PI * 2;
      }
    
      if (type === 'flicker') {
        motion.flicker = true;
      }
    
      if (type === 'blur') {
        motion.blur = Math.random() * 2;
      }
    
      // Set motion direction
      motion.dx = (Math.random() - 0.5) * 1.5;
      motion.dy = (Math.random() - 0.5) * 1.5;
    
      // OPTIONAL: add bounce behavior randomly (for modular or chaotic)
      if (Math.random() > 0.5) {
        motion.bounce = true;
      }
    
      return motion;
    }


    if (motionType === 'dynamic') {
      if (layoutType === 'structured') {
        if (!sharedMotion) {
          sharedMotion = getRandomMotion();
          sharedMotion.bounce = true; // ✅ Always bounce for structured
        }
        groupMotion = { ...groupMotion, ...sharedMotion };
      } else if (layoutType === 'modular') {
        groupMotion = { ...groupMotion, ...getRandomMotion() };
      }
    }
    for (let d = 0; d < duplicates; d++) {
      lines.forEach((line, j) => {
        let x = baseX, y = baseY;

        if (layoutType === 'chaotic') {
          const chaosMotion = getRandomMotion();
          const angle = Math.random() * 2 * Math.PI;
          const radius = Math.random() * 100 + 30;
          x += Math.cos(angle) * radius;
          y += Math.sin(angle) * radius;

          drawData.push({
            text: line,
            fontSize,
            color: group.color,
            x, y,
            groupId: i,
            layoutType,
            ...chaosMotion
          });
        } else {
          if (direction === 'horizontal') {
            x += d * (ctx.measureText(line).width + 6);
            y += j * fontSize * 1.2;
          } else if (direction === 'vertical') {
            x += j * (ctx.measureText(line).width + 6);
            y += d * fontSize * 1.2;
          } else {
            const flip = (d % 4 < 2) ? 1 : -1;
            const angle = direction === 'diagonal-zigzag' ? flip * baseAngle : baseAngle;
            const radius = (j + d) * (fontSize * 0.9);
            x += Math.cos(angle) * radius;
            y += Math.sin(angle) * radius;
          }

          drawData.push({
            text: line,
            fontSize,
            color: group.color,
            x, y,
            groupId: i,
            layoutType,
            ...groupMotion
          });
        }
      });
    }
  });

  motionType === 'static' ? drawFrame(false) : drawLoop();
}

function drawFrame(animated = true) {
  if (document.fonts && document.fonts.status !== 'loaded') {
    requestAnimationFrame(() => drawFrame(animated));
    return;
  }

  ctx.fillStyle = currentPalette[0];
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const grouped = {};
  drawData.forEach(d => {
    if (!grouped[d.groupId]) grouped[d.groupId] = [];
    grouped[d.groupId].push(d);
  });

  Object.values(grouped).forEach(group => {
    const groupCenterX = group.reduce((sum, el) => sum + el.x, 0) / group.length;
    const groupCenterY = group.reduce((sum, el) => sum + el.y, 0) / group.length;
    const sharedRotation = group[0].layoutType !== 'chaotic' ? group[0].rotation : 0;

    group.forEach(item => {
      if (animated) {
        const textWidth = ctx.measureText(item.text).width;
        const textHeight = item.fontSize;
      
        if (item.bounce) {
          if (item.x < 0 || item.x + textWidth > canvas.width) {
            item.dx *= -1;
            item.x = Math.max(0, Math.min(item.x, canvas.width - textWidth));
          }
          if (item.y < 0 || item.y + textHeight > canvas.height) {
            item.dy *= -1;
            item.y = Math.max(0, Math.min(item.y, canvas.height - textHeight));
          }
        }
      
        item.x += item.dx;
        item.y += item.dy;
        item.rotation += item.rotationSpeed || 0;
      }
      drawItem(item, animated, sharedRotation, groupCenterX, groupCenterY);
    });
  });
}

function drawItem(data, animated = true, sharedRotation = 0, centerX = 0, centerY = 0) {
  ctx.save();

  const rotation = data.layoutType === 'chaotic' ? data.rotation : sharedRotation;

  if (data.layoutType !== 'chaotic') {
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation || 0);
    ctx.translate(data.x - centerX, data.y - centerY);
  } else {
    ctx.translate(data.x, data.y);
    if (animated) ctx.rotate(data.rotation || 0);
  }

  const time = performance.now() / 1000;
  const scale = animated && data.dynamicScale
    ? 1 + Math.sin(time * data.scaleSpeed + data.scalePhase) * data.scaleAmplitude
    : 1;

  ctx.translate(0, 0);
  ctx.scale(scale, scale);
  ctx.filter = animated && data.blur ? `blur(${data.blur}px)` : 'none';
  ctx.font = `${data.fontSize}px '${currentFont}', sans-serif`;
  ctx.fillStyle = data.color;
  ctx.globalAlpha = animated && data.flicker ? 0.4 + Math.random() * 0.5 : 1;
  ctx.fillText(data.text, 0, 0);
  ctx.restore();
  ctx.filter = 'none';
  ctx.globalAlpha = 1;
}

function drawLoop() {
  drawFrame(true);
  animationFrameId = requestAnimationFrame(drawLoop);
}

function applyTextTransform(text, transform) {
  switch (transform) {
    case 'uppercase': return text.toUpperCase();
    case 'lowercase': return text.toLowerCase();
    case 'capitalize': return text.replace(/\b\w/g, c => c.toUpperCase());
    default: return text;
  }
}

function breakParagraphIntoLines(paragraph, maxChars = 60) {
  const words = paragraph.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + word).length <= maxChars) {
      line += word + ' ';
    } else {
      lines.push(line.trim());
      line = word + ' ';
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

function wrapLine(text, fontSize, maxWidth) {
  ctx.font = `${fontSize}px '${currentFont}', sans-serif`;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (let word of words) {
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width < maxWidth) {
      line = testLine;
    } else {
      lines.push(line.trim());
      line = word + ' ';
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}
