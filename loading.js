let overlay, textContainer, loadingCanvas, animationFrame;
let letterData = [];

export function showGeneratingOverlay(format = 'square') {
  overlay = document.getElementById('loading-overlay');
  textContainer = document.getElementById('loading-text');
  loadingCanvas = document.getElementById('loading-canvas');

  cancelAnimationFrame(animationFrame);
  textContainer.innerHTML = '';
  letterData = [];

  // Remove any previous format class
  loadingCanvas.className = 'loading-canvas';
  loadingCanvas.classList.add(format);

  const letters = 'GENERATING'.split('');
  const now = performance.now();

  letters.forEach((char) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.className = 'loading-letter';
    textContainer.appendChild(span);

    letterData.push({
      el: span,
      baseAngle: Math.random() * 360,
      speed: 0.002 + Math.random() * 0.003,
      direction: Math.random() > 0.5 ? 1 : -1,
      offset: Math.random() * 1000
    });
  });

  overlay.classList.add('visible');
  animateLoop();
}

function animateLoop() {
  const now = performance.now();

  letterData.forEach((l) => {
    const t = (now + l.offset) * l.speed;
    const angle = l.baseAngle + l.direction * (Math.sin(t) * 180);
    l.el.style.transform = `rotate(${angle}deg)`;
  });

  animationFrame = requestAnimationFrame(animateLoop);
}

export function hideGeneratingOverlay() {
  cancelAnimationFrame(animationFrame);
  overlay?.classList.remove('visible');
}

// Smooth easing
function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}