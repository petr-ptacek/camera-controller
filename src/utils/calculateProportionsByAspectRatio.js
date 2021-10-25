/**
 * @param {number} originWidth
 * @param {number} originHeight
 * @param {number} newWidth
 * @param {number} newHeight
 * @returns {{width: number, height: number}}
 */
export function calculateProportionsByAspectRatio(
  originWidth,
  originHeight,
  newWidth,
  newHeight
) {
  let calculatedWidth = newWidth;
  let calculatedHeight = newHeight;

  if ( newHeight > newWidth ) {
    calculatedWidth = (newHeight * originWidth) / originHeight;
  } else {
    calculatedHeight = (originHeight * newWidth) / originWidth;
  }

  return {
    width: Math.round(calculatedWidth),
    height: Math.round(calculatedHeight)
  };
}