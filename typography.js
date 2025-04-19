const typographySelector = document.getElementById('typography');

const API_KEY = 'AIzaSyAqo1s0HqiXQ2dDLCPurjYV1Kv3xTjEOaA';
const API_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`;

const fontsByStyle = {
  contemporary: [],
  brutalist: [],
  bookish: [],
  console: [],
  groovy: [],
  'loose-script': []
};

let fontsReady = false;
export let currentFont = 'sans-serif';

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    data.items.forEach(font => {
      const family = font.family;
      const name = family.toLowerCase();
      const category = font.category;

      if (
        category === 'sans-serif' &&
        !/(mono|grotesk|display|wide|ultra|rounded|hand|script|decor|brush|fancy|italic)/i.test(name)
      ) {
        fontsByStyle.contemporary.push(family);
      }

      if (category === 'sans-serif' && /(bold|black)/i.test(name)) {
        fontsByStyle.brutalist.push(family);
      }

      if (category === 'serif' && !/(script|calli|hand|cursive|loop)/i.test(name)) {
        fontsByStyle.bookish.push(family);
      }

      if (category === 'monospace') {
        fontsByStyle.console.push(family);
      }

      if (category === 'display' && /(grotesk|rounded|slab|ultra|fun|display|bold)/i.test(name)) {
        fontsByStyle.groovy.push(family);
      }

      if (category === 'handwriting') {
        fontsByStyle['loose-script'].push(family);
      }
    });

    fontsReady = true;
  })
  .catch(error => {
    console.error('Error fetching Google Fonts:', error);
  });

  export function updateTypographyStyle() {
    if (!fontsReady) return Promise.resolve();
  
    const selectedStyle = typographySelector.value;
    const fontList = fontsByStyle[selectedStyle];
    if (!fontList || fontList.length === 0) return Promise.resolve();
  
    const randomFont = fontList[Math.floor(Math.random() * fontList.length)];
    currentFont = randomFont;
    const fontNameForCSS = randomFont.replace(/ /g, '+');
  
    // Remove old font links
    document.querySelectorAll('link[data-dynamic-font]').forEach(link => link.remove());
  
    // Add new font link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontNameForCSS}&display=swap`;
    link.setAttribute('data-dynamic-font', 'true');
    document.head.appendChild(link);
  
    // Wait until font is fully loaded before returning
    return document.fonts.load(`16px '${currentFont}'`);
  }