/**
 * @param {string} url
 * @param {Object} options
 * @param {string} options.fileName
 * @returns {void}
 */
export function download(url, options) {
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', options.fileName);
  a.click();
}