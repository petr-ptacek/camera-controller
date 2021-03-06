/**
 * @param {HTMLElement} element
 * @param {HTMLElement|string} elementOrSelector
 * @returns {void}
 */
export function insertElementToDOM(element, elementOrSelector) {
  if ( typeof elementOrSelector === 'string' ) {
    document.querySelector(elementOrSelector)
            .append(element);
  }

  if ( elementOrSelector instanceof HTMLElement ) {
    elementOrSelector.append(element);
  }
}