import { createImg } from './createImg.js';

/**
 * @description Create a new resized HTMLImageElement from base64 or other HTMLImageElement
 * @param {HTMLImageElement|string} imgOrBase64
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number?} options.quality
 * @returns {Promise<HTMLImageElement>}
 */
export async function resizeImg(imgOrBase64, options) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = imgOrBase64 instanceof HTMLImageElement ?
    imgOrBase64 :
    await createImg(imgOrBase64);

  canvas.width = options.width;
  canvas.height = options.height;
  ctx.drawImage(img, 0, 0, options.width, options.height);

  return await createImg(canvas.toDataURL(undefined, options.quality));
}