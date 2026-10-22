// Converts a picked image into a compressed JPEG data URL.
//
// Firebase Storage is not available on the free plan, so the post itself
// carries the Base64 string. Compressing here keeps it under Firestore's 1 MB
// document limit (about 700k characters after encoding).

const DEFAULTS = { maxDimension: 1280, maxBytes: 700000 };

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    image.src = url;
  });
}

export async function prepareMedia(file, options = {}) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Only images can be added right now.');
  }

  const { maxDimension, maxBytes } = { ...DEFAULTS, ...options };
  const image = await loadImage(file);

  let scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  let quality = 0.82;

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= maxBytes) return dataUrl;

    quality = Math.max(0.4, quality - 0.1);
    scale = Math.max(0.3, scale * 0.82);
  }

  throw new Error('That image is too large. Please choose a smaller one.');
}
