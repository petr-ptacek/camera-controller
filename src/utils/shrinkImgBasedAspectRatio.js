import { resizeImg }                         from './resizeImg.js';
import { calculateProportionsByAspectRatio } from './calculateProportionsByAspectRatio';

/**
 * @param {HTMLImageElement} img
 * @param {Object} [options]
 * @param {number} [options.width=400]
 * @param {number} [options.height=400]
 * @param {number} [options.quality=0.85]
 * @returns {Promise<HTMLImageElement>}
 */
export async function shrinkImgBasedAspectRatio(img, options = {}) {
  let newWidth = 400;
  let newHeight = 400;

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