/**
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export async function createImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const clear = () => {
      delete img.onload;
      delete img.onerror;
    };

    img.onload = () => {
      clear();
      resolve(img);
    };

    img.onerror = e => {
      clear();
      reject(e);
    };

    img.src = src;

    if ( img.complete ) {
      clear();
      resolve(img);
    }
  });
}