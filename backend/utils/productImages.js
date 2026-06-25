const colorPairs = [
  ['#ffffff', '#facc15', '#111827'],
  ['#a50044', '#004d98', '#ffffff'],
  ['#da291c', '#111827', '#ffffff'],
  ['#6cabdd', '#ffffff', '#0f172a'],
  ['#c8102e', '#00b2a9', '#ffffff'],
  ['#ef0107', '#ffffff', '#ffffff'],
  ['#034694', '#ffffff', '#ffffff'],
  ['#dc052d', '#0066b2', '#ffffff'],
  ['#fde100', '#000000', '#111827'],
  ['#004170', '#da291c', '#ffffff'],
];

function hashString(value) {
  return String(value || '').split('').reduce((hash, char) => {
    return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  }, 0);
}

function svgToDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeSvg(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildProductSvg(product) {
  const name = escapeSvg(product.name || '7amo Store');
  const category = escapeSvg(product.category || 'Sports');
  const [primary, secondary, text] = colorPairs[Math.abs(hashString(product.sku || product.name)) % colorPairs.length];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <radialGradient id="glow" cx="50%" cy="34%" r="62%">
      <stop offset="0%" stop-color="${secondary}" stop-opacity=".26"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="900" height="900" fill="#0f172a"/>
  <rect width="900" height="900" fill="url(#glow)"/>
  <rect x="72" y="72" width="756" height="756" rx="44" fill="#111827" stroke="#243244" stroke-width="4"/>
  <path d="M326 146h248l82 66 114 42-56 156-92-32v326c0 29-24 53-53 53H331c-29 0-53-24-53-53V378l-92 32-56-156 114-42 82-66z" fill="${primary}" stroke="#e5e7eb" stroke-opacity=".32" stroke-width="6"/>
  <path d="M326 146c22 62 72 96 124 96s102-34 124-96" fill="none" stroke="${secondary}" stroke-width="24" stroke-linecap="round"/>
  <path d="M450 260v482" stroke="${secondary}" stroke-width="52" stroke-opacity=".9"/>
  <path d="M278 378l-92 32-56-156 114-42 34 74v92z" fill="${secondary}" fill-opacity=".9"/>
  <path d="M622 378l92 32 56-156-114-42-34 74v92z" fill="${secondary}" fill-opacity=".9"/>
  <circle cx="450" cy="420" r="72" fill="#ffffff" fill-opacity=".14" stroke="${secondary}" stroke-width="8"/>
  <text x="450" y="434" font-family="Arial, Helvetica, sans-serif" font-size="60" font-weight="800" text-anchor="middle" fill="${text}">7</text>
  <text x="450" y="654" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="800" text-anchor="middle" fill="${text}">${name}</text>
  <text x="450" y="706" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" text-anchor="middle" fill="${text}" opacity=".72">${category}</text>
</svg>`;
}

function isBrokenUploadImage(image) {
  if (!image) return true;
  return image.includes('localhost') || image.includes('/uploads/');
}

function normalizeProductImage(product) {
  const plainProduct = typeof product.toObject === 'function' ? product.toObject() : { ...product };

  if (isBrokenUploadImage(plainProduct.image)) {
    plainProduct.image = svgToDataUri(buildProductSvg(plainProduct));
  }

  return plainProduct;
}

module.exports = {
  normalizeProductImage,
};
