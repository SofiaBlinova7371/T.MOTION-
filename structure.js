// STRUCTURE.JS — Final Update

import { generateMoodPalette } from './mood.js';
import { currentFont } from './typography.js';

const structureSlider = document.getElementById('structure');
const moodSelector = document.getElementById('mood');
const canvas = document.getElementById('artwork-canvas');
const ctx = canvas.getContext('2d');

let animationFrameId = null;
let drawData = [];
let currentPalette = null;

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
    const baseMin = 6;
    const baseMax = 12;
    const layoutMultiplier = layoutType === 'chaotic' ? 1.4 : layoutType === 'modular' ? 1.2 : 1;

    const totalTargetGroups = Math.floor(
      (Math.random() * (baseMax - baseMin) + baseMin) * layoutMultiplier
    );

    const weightAdjusted = weight * totalTargetGroups;
    const numGroups = Math.max(1, Math.floor(weightAdjusted + Math.random()));

    for (let g = 0; g < numGroups; g++) {
      let fontSize;

      if (layoutType === 'structured') {
        fontSize = 14 + Math.random() * 18; 
      } else if (layoutType === 'modular') {
        fontSize = 12 + Math.random() * 30; 
      } else {
        fontSize = 10 + Math.random() * 40; 
      }

allGroups.push({
  text: paragraph,
  size: fontSize,
  transform: ['none', 'uppercase', 'lowercase', 'capitalize'][Math.floor(Math.random() * 4)],
  color: colors[(pIndex + g + 1) % colors.length]
});
    }
  });

  const totalGroups = allGroups.length;
  const groupPositions = [];

  allGroups.forEach((group, i) => {
    const fontSize = group.size;
    const text = applyTextTransform(group.text, group.transform);
    ctx.font = `${fontSize}px '${currentFont}', sans-serif`;
    const lines = wrapLine(text, fontSize, canvas.width * 0.5);

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
      layoutType === 'chaotic'
        ? 'cloud'
        : layoutType === 'structured'
        ? ['horizontal', 'vertical'][i % 2]
        : ['horizontal', 'vertical', 'diagonal', 'diagonal-zigzag'][Math.floor(Math.random() * 4)];

    const diagonalRight = Math.random() > 0.5;
    const baseAngle = diagonalRight ? Math.PI / 4 : -Math.PI / 4;

    const groupMotion = {
      dx: 0,
      dy: 0,
      rotation: 0,
      rotationSpeed: 0,
      bounce: Math.random() > 0.3,
      dynamicScale: false,
      scaleSpeed: 0,
      scaleAmplitude: 0,
      scalePhase: 0
    };
    
    if (motionType === 'dynamic') {
      groupMotion.dx = (Math.random() - 0.5) * 1.2;
      groupMotion.dy = (Math.random() - 0.5) * 1.2;
    
      if (Math.random() > 0.4) {
        groupMotion.rotationSpeed = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.01 + 0.002);
      }
    
      if (Math.random() > 0.5) {
        groupMotion.dynamicScale = true;
        groupMotion.scaleSpeed = 2 + Math.random() * 3;
        groupMotion.scaleAmplitude = 0.15 + Math.random() * 0.25;
        groupMotion.scalePhase = Math.random() * Math.PI * 2;
      }
    }

    for (let d = 0; d < duplicates; d++) {
      lines.forEach((line, j) => {
        let x = baseX;
        let y = baseY;
    
        // Positioning logic
        if (layoutType === 'chaotic') {
          const angle = Math.random() * 2 * Math.PI;
          const radius = Math.random() * 100 + 30;
          x += Math.cos(angle) * radius;
          y += Math.sin(angle) * radius;
        } else if (direction === 'horizontal') {
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
    
        // Motion variables
        let dx = groupMotion.dx,
            dy = groupMotion.dy,
            flicker = false,
            blur = 0,
            scale = 1,
            rotation = groupMotion.rotation,
            rotationSpeed = groupMotion.rotationSpeed,
            dynamicScale = false,
            scaleSpeed = 0,
            scaleAmplitude = 0,
            scalePhase = 0,
            individualRotation = false;
    
        if (motionType === 'dynamic') {
          // Structured layout — group-based scale
          if (layoutType === 'structured') {
            dynamicScale = groupMotion.dynamicScale;
            scaleSpeed = groupMotion.scaleSpeed;
            scaleAmplitude = groupMotion.scaleAmplitude;
            scalePhase = groupMotion.scalePhase;
          }
    
          // Modular layout — shared + optional per-line override
          if (layoutType === 'modular') {
            const effects = ['flicker', 'rotation', 'scale', 'blur']
              .sort(() => 0.5 - Math.random())
              .slice(0, Math.random() > 0.75 ? 2 : 0); // sometimes add 2 effects
    
            if (effects.includes('flicker')) flicker = true;
            if (effects.includes('rotation')) {
              rotationSpeed = (Math.random() - 0.5) * 0.02;
              individualRotation = true;
            }
            if (effects.includes('scale')) {
              dynamicScale = true;
              scaleSpeed = 2 + Math.random() * 3;
              scaleAmplitude = 0.2 + Math.random() * 0.3;
              scalePhase = Math.random() * Math.PI * 2;
            } else {
              // fall back to group-level
              dynamicScale = groupMotion.dynamicScale;
              scaleSpeed = groupMotion.scaleSpeed;
              scaleAmplitude = groupMotion.scaleAmplitude;
              scalePhase = groupMotion.scalePhase;
            }
            if (effects.includes('blur')) blur = Math.random() * 1.5;
          }
    
          // Chaotic — fully randomized
          if (layoutType === 'chaotic') {
            dx = (Math.random() - 0.5) * 2.5;
            dy = (Math.random() - 0.5) * 2.5;
    
            const effects = ['flicker', 'rotation', 'scale', 'blur']
              .sort(() => 0.5 - Math.random())
              .slice(0, 2);
    
            if (effects.includes('flicker')) flicker = true;
            if (effects.includes('rotation')) {
              rotationSpeed = (Math.random() - 0.5) * 0.05;
              individualRotation = true;
            }
            if (effects.includes('scale')) {
              dynamicScale = true;
              scaleSpeed = 2 + Math.random() * 3;
              scaleAmplitude = 0.3 + Math.random() * 0.4;
              scalePhase = Math.random() * Math.PI * 2;
            }
            if (effects.includes('blur')) blur = Math.random() * 2;
          }
        }
    const colorIndex = colors.indexOf(group.color);
const colorShift = motionType === 'dynamic' && Math.random() > 0.8; // 20% chance to shift color

drawData.push({
  text: line,
  fontSize,
  color: group.color,
  colorIndex,
  colorShift,
  x, y,
  dx, dy,
  flicker,
  blur,
  rotation,
  rotationSpeed,
  individualRotation: layoutType === 'chaotic' || (layoutType === 'modular' && Math.random() > 0.75),
  scale,
  dynamicScale,
  scaleSpeed,
  scaleAmplitude,
  scalePhase,
  bounce: layoutType === 'structured' ? groupMotion.bounce : Math.random() > 0.6,
  groupId: i,
  layoutType
});
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

  // Inside drawFrame
Object.values(grouped).forEach(group => {
  if (!animated) {
    return group.forEach(item => drawItem(item, false));
  }

  // Group center for structured/modular rotation
  const groupCenterX = group.reduce((sum, el) => sum + el.x, 0) / group.length;
  const groupCenterY = group.reduce((sum, el) => sum + el.y, 0) / group.length;
  const sharedRotation = group[0].layoutType !== 'chaotic' ? group[0].rotation : 0;

  group.forEach(item => {
    // Update motion
    if (item.bounce) {
      if (item.x < 0 || item.x > canvas.width - 60) item.dx *= -1;
      if (item.y < 0 || item.y > canvas.height - 30) item.dy *= -1;
    }

    item.x += item.dx;
    item.y += item.dy;

    if (item.rotationSpeed) item.rotation += item.rotationSpeed;
  });

  group.forEach(item => {
    drawItem(item, true, sharedRotation, groupCenterX, groupCenterY);
  });
});
}

// Updated drawItem()
function drawItem(data, animated = true, sharedRotation = 0, centerX = 0, centerY = 0) {
  ctx.save();

  const rotation = data.layoutType === 'chaotic' || data.individualRotation ? data.rotation : sharedRotation;

  // Determine center of rotation
  if (sharedRotation && data.layoutType !== 'chaotic' && !data.individualRotation) {
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation || 0);
    ctx.translate(data.x - centerX, data.y - centerY);
  } else {
    ctx.translate(data.x, data.y);
    if (animated) ctx.rotate(rotation || 0);
  }

  // Scale oscillation
  const time = performance.now() / 1000;
  const scale = animated && data.dynamicScale
    ? 1 + Math.sin(time * data.scaleSpeed + data.scalePhase) * data.scaleAmplitude
    : (animated ? (data.scale || 1) : 1);

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
