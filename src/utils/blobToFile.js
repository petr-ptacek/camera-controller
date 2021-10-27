/**
 * @param {Blob} blob
 * @param {Object} options
 * @param {string} options.fileName
 * @param {string?} options.mimeType
 * @returns {File}
 */
export function blobToFile(blob, options) {
  return new File(
    [blob],
    options.fileName,
    { type: options.mimeType || blob.type }
  );
}