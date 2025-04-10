const structureSlider = document.getElementById('structure');
const motionType = document.getElementById('motion');

export function applyMotion() {
  const scale = parseInt(structureSlider.value);
  const isDynamic = motionType.value === 'dynamic';
  const lines = document.querySelectorAll('.text-copy');

  lines.forEach(line => {
    line.style.animation = '';
    line.innerHTML = line.innerText;
  });

  if (!isDynamic) return;

  const mode = getScaleMode(scale);
  const count = getLayerCount(mode);

  if (mode === 'structured') {
    const animation = generateDynamicAnimations(count, getSpeed(mode), scale);
    lines.forEach(line => {
      line.style.animation = animation;
    });
  }

  else if (mode === 'complex') {
    lines.forEach(line => {
      line.style.animation = generateDynamicAnimations(count, getSpeed(mode), scale);
    });
  }

  else if (mode === 'chaotic') {
    lines.forEach(line => {
      const chars = line.innerText.split('');
      line.innerHTML = chars.map(c => `<span class="char">${c}</span>`).join('');
      line.querySelectorAll('.char').forEach(char => {
        char.style.display = 'inline-block';
        char.style.animation = generateDynamicAnimations(count, getSpeed(mode), scale);
      });
    });
  }
}

function getScaleMode(scale) {
  if (scale <= 33) return 'structured';
  if (scale <= 66) return 'complex';
  return 'chaotic';
}

function getSpeed(mode) {
  if (mode === 'structured') return (Math.random() * 3 + 4).toFixed(1); // 4–7s
  if (mode === 'complex')    return (Math.random() * 5 + 2).toFixed(1); // 2–7s
  return (Math.random() * 5 + 2).toFixed(1);                             // chaotic
}

function getLayerCount(mode) {
  if (mode === 'structured') return 1;
  if (mode === 'complex')    return 2;
  return 2;
}

function generateDynamicAnimations(count, speed, scale) {
  const keyframes = [];
  const duration = `${speed}s`;

  const allTypes = ['moveX', 'moveY', 'rotate', 'scale', 'flicker', 'glitch', 'blur', 'skew'];
  while (keyframes.length < count) {
    const pick = allTypes[Math.floor(Math.random() * allTypes.length)];
    if (!keyframes.includes(pick)) keyframes.push(pick);
  }

  return keyframes
    .map(type => `${generateKeyframeClass(type, scale)} ${duration} ease-in-out infinite alternate`)
    .join(', ');
}

function generateKeyframeClass(type, scale) {
  const id = Math.floor(Math.random() * 100000);
  const style = document.createElement('style');
  let rules = '';

  const range = scale > 75 ? 100 : scale > 50 ? 60 : scale > 25 ? 30 : 15;

  switch (type) {
    case 'moveX':
      const x = (Math.random() * range).toFixed(1);
      rules = `@keyframes moveX_${id} {
        0% { transform: translateX(0); }
        100% { transform: translateX(${Math.random() > 0.5 ? '' : '-'}${x}px); }
      }`;
      break;
    case 'moveY':
      const y = (Math.random() * range).toFixed(1);
      rules = `@keyframes moveY_${id} {
        0% { transform: translateY(0); }
        100% { transform: translateY(${Math.random() > 0.5 ? '' : '-'}${y}px); }
      }`;
      break;
    case 'rotate':
      const deg = scale > 75 ? 360 : scale > 50 ? 180 : 45;
      rules = `@keyframes rotate_${id} {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(${Math.random() > 0.5 ? '' : '-'}${deg}deg); }
      }`;
      break;
    case 'scale':
      const factor = (Math.random() * 0.5 + 1.1).toFixed(2);
      rules = `@keyframes scale_${id} {
        0% { transform: scale(1); }
        100% { transform: scale(${factor}); }
      }`;
      break;
    case 'flicker':
      rules = `@keyframes flicker_${id} {
        0%, 100% { opacity: 1; }
        50% { opacity: ${Math.random() * 0.4 + 0.3}; }
      }`;
      break;
    case 'glitch':
      const dx = (Math.random() * 40).toFixed(1);
      const dy = (Math.random() * 40).toFixed(1);
      rules = `@keyframes glitch_${id} {
        0% { transform: translate(0, 0); }
        33% { transform: translate(${dx}px, ${dy}px); }
        66% { transform: translate(-${dx}px, -${dy}px); }
        100% { transform: translate(0, 0); }
      }`;
      break;
    case 'blur':
      const blur = (Math.random() * 2).toFixed(1);
      rules = `@keyframes blur_${id} {
        0% { filter: blur(0); }
        100% { filter: blur(${blur}px); }
      }`;
      break;
    case 'skew':
      const skewX = (Math.random() * 20 - 10).toFixed(1);
      const skewY = (Math.random() * 20 - 10).toFixed(1);
      rules = `@keyframes skew_${id} {
        0% { transform: skew(0, 0); }
        100% { transform: skew(${skewX}deg, ${skewY}deg); }
      }`;
      break;
  }

  const name = `${type}_${id}`;
  style.innerHTML = rules;
  document.head.appendChild(style);
  return name;
}
