/**
 * @param {Object?} options
 * @param {number?} options.width
 * @param {number?} options.height
 * @param {string?} options.bgColor
 * @returns {HTMLCanvasElement}
 */
export function createCanvas(options = {}) {
  /** @type {HTMLCanvasElement} */
  const canvas = document.createElement('canvas');
  /** @type {CanvasRenderingContext2D} */
  const ctx = canvas.getContext('2d');

  if ( typeof options.width === 'number' ) {
    canvas.width = options.width;
  }

  if ( typeof options.height === 'number' ) {
    canvas.height = options.height;
  }

  if ( typeof options.bgColor === 'string' ) {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fill();
  }

  return canvas;
}