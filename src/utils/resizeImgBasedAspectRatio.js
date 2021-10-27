import { resizeImg }                         from './resizeImg.js';
import { calculateProportionsByAspectRatio } from './calculateProportionsByAspectRatio.js';
import { createImg }                         from './createImg.js';

/**
 * @param {HTMLImageElement|string} imgOrBase64
 * @param {Object} [options]
 * @param {number} [options.width=400]
 * @param {number} [options.height=400]
 * @param {number} [options.quality=0.85]
 * @returns {Promise<HTMLImageElement>}
 */
export async function resizeImgBasedAspectRatio(imgOrBase64, options = {}) {
  let newWidth = 400;
  let newHeight = 400;
  const img = imgOrBase64 instanceof HTMLImageElement ?
    imgOrBase64 :
    await createImg(imgOrBase64);

  if ( typeof options.width === 'number' && typeof options.height === 'number' ) {
    newWidth = options.width;
    newHeight = options.height;
  }

  if ( typeof options.width === 'number' && typeof options.height !== 'number' ) {
    newWidth = options.width;
    newHeight = 0;
  }

  if ( typeof options.height === 'number' && typeof options.width !== 'number' ) {
    newHeight = options.height;
    newWidth = 0;
  }


  const proportionsByAspectRatio = calculateProportionsByAspectRatio(
    img.naturalWidth,
    img.naturalHeight,
    newWidth,
    newHeight
  );

  return await resizeImg(
    img,
    {
      quality: options.quality ?? 0.85,
      width: proportionsByAspectRatio.width,
      height: proportionsByAspectRatio.height
    }
  );
}