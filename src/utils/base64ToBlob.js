/**
 * https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript?rq=1
 * The atob function will decode a Base64-encoded string into a new string
 * with a character for each byte of the binary data.
 */

/**
 * @param {string} base64
 * @param {Object?} options
 * @param {string?} options.mimeType
 * @returns {Blob}
 */
export function base64ToBlob(base64, options = {}) {
  const [contentMetadata, contentData] = base64.split(',');
  const contentType = options.mimeType || contentMetadata.substring(
    contentMetadata.indexOf(':') + 1,
    contentMetadata.indexOf(';')
  );

  /**
   * @type {string}
   */
  const byteCharacters = atob(contentData);
  /**
   * @type {number[]}
   */
  const byteNumbers = Array.from({ length: byteCharacters.length });

  for (
    let index = 0, length = byteCharacters.length;
    index < length;
    index++
  ) {
    byteNumbers[index] = byteCharacters.charCodeAt(index);
  }

  return new Blob(
    [new Uint8Array(byteNumbers)],
    { type: contentType }
  );
}