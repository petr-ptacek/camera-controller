/**
 * @param {HTMLImageElement} img
 * @param {Object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} [options.quality]
 * @returns {Promise<HTMLImageElement>}
 */
export function resizeImg(img, options) {
  let resolve = null;
  let reject = null;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = options.width;
  canvas.height = options.height;
  ctx.drawImage(img, 0, 0, options.width, options.height);

  const resizedImg = new Image();
  resizedImg.onload = () => resolve(resizedImg);
  resizedImg.onerror = (e) => reject(e);
  resizedImg.src = canvas.toDataURL(undefined, options.quality);

  if ( resizedImg.complete ) {
    delete resizedImg.onload;
    delete resizedImg.onerror;
    resolve(resizedImg);
  }

  return promise;
}