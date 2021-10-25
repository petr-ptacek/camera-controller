/**
 * @typedef ExecAsyncResult
 * @type {Object}
 * @template T
 * @property {(T|null)} data
 * @property {(Error|null)} error
 */

/**
 * @function
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<ExecAsyncResult<T>>}
 */
export async function execAsync(promise) {
  /**
   * @type {ExecAsyncResult<T>}
   */
  const result = { data: null, error: null };

  try {
    result.result = await promise;
  } catch ( e ) {
    result.error = e;
  }

  return result;
}

