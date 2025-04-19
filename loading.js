let overlay, textContainer, animationFrame;
let letterData = [];

export function showGeneratingOverlay(duration = 8000) {
  overlay = document.getElementById('loading-overlay');
  textContainer = document.getElementById('loading-text');

  cancelAnimationFrame(animationFrame);
  textContainer.innerHTML = '';
  letterData = [];

  const letters = 'GENERATING'.split('');
  const now = performance.now();

  letters.forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.className = 'loading-letter';
    textContainer.appendChild(span);

    letterData.push({
      el: span,
      baseAngle: Math.random() * 360,
      speed: 0.002 + Math.random() * 0.003, // radians/ms
      direction: Math.random() > 0.5 ? 1 : -1,
      offset: Math.random() * 1000 // phase offset
    });
  });

  overlay.classList.add('visible');

  animateLoop();
}

function animateLoop() {
  const now = performance.now();

  letterData.forEach((l, i) => {
    const t = (now + l.offset) * l.speed;
    const angle = l.baseAngle + l.direction * (Math.sin(t) * 180);
    l.el.style.transform = `rotate(${angle}deg)`;
  });

  animationFrame = requestAnimationFrame(animateLoop);
}

export function hideGeneratingOverlay() {
  cancelAnimationFrame(animationFrame);
  if (overlay) overlay.classList.remove('visible');
}

// Smooth easing
function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}