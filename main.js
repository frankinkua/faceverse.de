/**
 * Deterministic string hash (FNV-1a)
 * @param {string} str - The input string (e.g., name)
 * @returns {number} A 32-bit integer hash
 */
function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

/**
 * Creates a pseudo-random number generator from a seed
 */
function createPRNG(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

/**
 * Generates an SVG avatar based on a name string
 */
function generateAvatar(name) {
  if (!name || name.trim() === '') {
    name = 'Anonymous';
  }

  const hash = hashString(name);
  const prng = createPRNG(hash);

  const size = 200;

  // Vibrant color palette
  const palettes = [
    ['#8a2be2', '#008080', '#ff00ff', '#f0f8ff', '#ffd700'], // Violet, Teal, Magenta, AliceBlue, Gold
    ['#ff4500', '#1e90ff', '#32cd32', '#ff69b4', '#ffff00'], // OrangeRed, DodgerBlue, LimeGreen, HotPink, Yellow
    ['#4b0082', '#00ced1', '#ff1493', '#adff2f', '#ff8c00']  // Indigo, DarkTurquoise, DeepPink, GreenYellow, DarkOrange
  ];

  const paletteIndex = Math.floor(prng() * palettes.length);
  const colors = palettes[paletteIndex];

  // Shuffle colors deterministically
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }

  const bgColors = [colors[0], colors[1]];
  const fgColors = colors.slice(2);

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%">`;

  // Add gradient defs
  const gradId = `bg-grad-${Math.floor(prng() * 1000)}`;
  svgContent += `<defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColors[0]}" />
      <stop offset="100%" stop-color="${bgColors[1]}" />
    </linearGradient>
  </defs>`;

  // Background
  const isCircleBg = prng() > 0.5;
  if (isCircleBg) {
    svgContent += `<circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#${gradId})" />`;
  } else {
    const radius = Math.floor(prng() * 30) + 10;
    svgContent += `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="url(#${gradId})" />`;
  }

  // Face Base
  const faceTypes = ['circle', 'rect', 'polygon'];
  const faceType = faceTypes[Math.floor(prng() * faceTypes.length)];
  const faceColor = fgColors[0];

  if (faceType === 'circle') {
    svgContent += `<circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="${faceColor}" opacity="0.9" />`;
  } else if (faceType === 'rect') {
    svgContent += `<rect x="${size*0.15}" y="${size*0.15}" width="${size*0.7}" height="${size*0.7}" rx="20" fill="${faceColor}" opacity="0.9" />`;
  } else {
    // hexagon-ish
    svgContent += `<polygon points="${size*0.5},${size*0.1} ${size*0.9},${size*0.3} ${size*0.9},${size*0.7} ${size*0.5},${size*0.9} ${size*0.1},${size*0.7} ${size*0.1},${size*0.3}" fill="${faceColor}" opacity="0.9" />`;
  }

  // Eyes
  const eyeColor = fgColors[1] || '#ffffff';
  const eyeShape = prng() > 0.5 ? 'circle' : 'rect';
  const eyeY = size * 0.4;
  const eyeXOffset = size * 0.15;
  const eyeSize = Math.floor(prng() * 10) + 10;

  if (eyeShape === 'circle') {
    svgContent += `<circle cx="${size/2 - eyeXOffset}" cy="${eyeY}" r="${eyeSize}" fill="${eyeColor}" />`;
    svgContent += `<circle cx="${size/2 + eyeXOffset}" cy="${eyeY}" r="${eyeSize}" fill="${eyeColor}" />`;
  } else {
    svgContent += `<rect x="${size/2 - eyeXOffset - eyeSize}" y="${eyeY - eyeSize/2}" width="${eyeSize*2}" height="${eyeSize}" rx="5" fill="${eyeColor}" />`;
    svgContent += `<rect x="${size/2 + eyeXOffset - eyeSize}" y="${eyeY - eyeSize/2}" width="${eyeSize*2}" height="${eyeSize}" rx="5" fill="${eyeColor}" />`;
  }

  // Mouth
  const mouthColor = fgColors[2] || '#000000';
  const mouthY = size * 0.65;
  const mouthTypes = ['smile', 'line', 'square'];
  const mouthType = mouthTypes[Math.floor(prng() * mouthTypes.length)];

  if (mouthType === 'smile') {
    svgContent += `<path d="M ${size*0.35} ${mouthY} Q ${size*0.5} ${size*0.8} ${size*0.65} ${mouthY}" fill="none" stroke="${mouthColor}" stroke-width="8" stroke-linecap="round" />`;
  } else if (mouthType === 'line') {
    svgContent += `<line x1="${size*0.35}" y1="${mouthY}" x2="${size*0.65}" y2="${mouthY}" stroke="${mouthColor}" stroke-width="8" stroke-linecap="round" />`;
  } else {
    svgContent += `<rect x="${size*0.4}" y="${mouthY - 5}" width="${size*0.2}" height="10" rx="5" fill="${mouthColor}" />`;
  }

  // Decorative Elements
  const numDecorations = Math.floor(prng() * 3) + 1;
  for (let i = 0; i < numDecorations; i++) {
    const decColor = bgColors[Math.floor(prng() * bgColors.length)];
    const decSize = Math.floor(prng() * 20) + 5;
    const decX = Math.floor(prng() * size);
    const decY = Math.floor(prng() * size);
    if (prng() > 0.5) {
      svgContent += `<circle cx="${decX}" cy="${decY}" r="${decSize}" fill="${decColor}" opacity="0.4" />`;
    } else {
      svgContent += `<rect x="${decX}" y="${decY}" width="${decSize}" height="${decSize}" fill="${decColor}" opacity="0.4" transform="rotate(${Math.floor(prng()*45)} ${decX} ${decY})" />`;
    }
  }

  svgContent += `</svg>`;
  return svgContent;
}

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('name-input');
  const avatarContainer = document.getElementById('avatar-container');
  const downloadBtn = document.getElementById('download-btn');

  if (!nameInput || !avatarContainer || !downloadBtn) return;

  let currentSvgContent = '';

  const updateAvatar = () => {
    const name = nameInput.value;
    currentSvgContent = generateAvatar(name);
    avatarContainer.innerHTML = currentSvgContent;
  };

  // Initial render
  updateAvatar();

  // Event Listeners
  nameInput.addEventListener('input', updateAvatar);

  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentSvgContent) return;

    const blob = new Blob([currentSvgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');

    const safeName = nameInput.value.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'avatar';
    downloadLink.href = url;
    downloadLink.download = `faceverse_${safeName}.svg`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  });
});
