function generateColorGroupFromProps({
    hueRange = [0, 360],
    satRange = [0.5, 1],
    lightRange = [0.4, 0.9],
    count = 6,
    monochrome = false,
    harmonic = false
  }) {
    const baseHue = monochrome || harmonic ? Math.random() * 360 : null;
    const baseSat = harmonic ? Math.random() * (satRange[1] - satRange[0]) + satRange[0] : null;
  
    const colors = [];
    for (let i = 0; i < count; i++) {
      const h = monochrome || harmonic
        ? baseHue
        : Math.random() * (hueRange[1] - hueRange[0]) + hueRange[0];
  
      const s = harmonic
        ? baseSat
        : Math.random() * (satRange[1] - satRange[0]) + satRange[0];
  
      const l = Math.random() * (lightRange[1] - lightRange[0]) + lightRange[0];
      colors.push(chroma.hsl(h, s, l).hex());
    }
  
    return colors;
  }
  
  export function generateMoodPalette(mood) {
    let palette = [];
  
    switch (mood) {
        case 'warm':
        palette = generateColorGroupFromProps({
            hueRange: Math.random() > 0.5 ? [0, 25] : [340, 360], // strong reds & hot pinks
            satRange: [0.7, 1],     // vivid, avoids dullness
            lightRange: [0.4, 0.7], // keep it rich, not washed out
            count: 6
        });
        break;
  
      case 'cold':
        palette = generateColorGroupFromProps({
          hueRange: [190, 260], // cool blues and purples
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
            // dark background, text from similar hues
            const baseHueMoody = Math.random() * 360;
            const baseSaturationMoody = Math.random() * 0.3 + 0.4; // rich but not neon
        
            palette = [];
        
            for (let i = 0; i < 6; i++) {
                const hueVariation = Math.random() * 30 - 15; // ±15 degrees
                const h = (baseHueMoody + hueVariation + 360) % 360;
                const l = i === 0
                ? Math.random() * 0.1 + 0.15 // very dark background
                : Math.random() * 0.3 + 0.4; // lighter, readable text
                palette.push(chroma.hsl(h, baseSaturationMoody, l).hex());
            }
            break;
  
      default:
        palette = ['#ffffff', '#000000'];
    }
  
    const background = palette[0];
    const textColors = palette.slice(1).map(c => {
      const contrast = chroma.contrast(background, c);
      if (contrast < 4.5) {
        return chroma(c).luminance() > chroma(background).luminance()
          ? chroma(c).darken(1).hex()
          : chroma(c).brighten(1).hex();
      }
      return c;
    });
  
    return [background, ...textColors];
  }