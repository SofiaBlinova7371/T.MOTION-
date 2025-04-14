// 🎨 Dynamic color palette generator
function generateColorGroupFromProps({
  hueRange = [0, 360],
  satRange = [0.5, 1],
  lightRange = [0.4, 0.9],
  count = 6,
  monochrome = false,
  harmonic = false
}) {
  const baseHue = monochrome || harmonic ? Math.random() * 360 : null;
  const baseSat = harmonic || monochrome
    ? Math.random() * (satRange[1] - satRange[0]) + satRange[0]
    : null;

  const colors = [];

  for (let i = 0; i < count; i++) {
    const h = monochrome || harmonic
      ? baseHue
      : Math.random() * (hueRange[1] - hueRange[0]) + hueRange[0];

    const s = harmonic || monochrome
      ? baseSat
      : Math.random() * (satRange[1] - satRange[0]) + satRange[0];

    const l = Math.random() * (lightRange[1] - lightRange[0]) + lightRange[0];
    colors.push(chroma.hsl(h, s, l).hex());
  }

  return colors;
}

// 🧠 Master mood selector
export function generateMoodPalette(mood) {
  let palette = [];

  switch (mood) {
    case 'warm':
      palette = generateColorGroupFromProps({
        hueRange: Math.random() > 0.5 ? [0, 25] : [340, 360],
        satRange: [0.7, 1],
        lightRange: [0.4, 0.7],
        count: 6
      });
      break;

    case 'cold':
      palette = generateColorGroupFromProps({
        hueRange: [190, 260],
        satRange: [0.6, 1],
        lightRange: [0.3, 0.7],
        count: 6
      });
      break;

    case 'vibrant':
      palette = generateColorGroupFromProps({
        hueRange: [0, 360],
        satRange: [0.9, 1],
        lightRange: [0.35, 0.8],
        count: 6
      });
      break;

    case 'soft':
      palette = generateColorGroupFromProps({
        hueRange: [0, 360],
        satRange: [0.15, 0.35],
        lightRange: [0.75, 0.95],
        count: 6
      });
      break;

    case 'monochrome':
      palette = generateColorGroupFromProps({
        monochrome: true,
        satRange: [0.4, 0.7],
        lightRange: [0.08, 0.9],
        count: 6
      });

      // Sort to ensure darkest is always background
      palette.sort((a, b) => chroma(a).luminance() - chroma(b).luminance());
      break;

    default:
      palette = ['#ffffff', '#000000'];
  }

  const background = palette[0];

  const textColors = palette.slice(1).map(c => {
    const contrast = chroma.contrast(background, c);
    if (contrast < 4.5) {
      const [h, s, l] = chroma(c).hsl();
      const bgL = chroma(background).hsl()[2];
      const newL = l > bgL ? l - 0.15 : l + 0.15;
      return chroma.hsl(h, s, Math.max(0, Math.min(1, newL))).hex();
    }
    return c;
  });

  return [background, ...textColors];
}