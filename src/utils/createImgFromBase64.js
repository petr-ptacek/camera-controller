/**
 * @param {string} base64
 * @returns {Promise<HTMLImageElement>}
 */
export async function createImgFromBase64(base64) {
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

    img.src = base64;

    if ( img.complete ) {
      clear();
      resolve(img);
    }
  });
}