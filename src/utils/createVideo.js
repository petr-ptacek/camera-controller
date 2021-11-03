/**
 * @param {Object?} options
 * @param {number?} options.width
 * @param {number?} options.height
 * @param {boolean?} options.autoplay
 * @returns {HTMLVideoElement}
 */
export function createVideo(options = {}) {
  /**
   * @type {HTMLVideoElement}
   */
  const videoElement = document.createElement('video');
  videoElement.muted = true;
  videoElement.autoplay = options.autoplay ?? true;

  if ( typeof options.width === 'number' && typeof options.height === 'number' ) {
    videoElement.width = options.width;
    videoElement.height = options.height;
  }

  return videoElement;
}