import faceApi from 'face-api.js';

/**
 * @typedef {import('@/typings').FaceDetectorOptions} FaceDetectorOptions
 */

export class FaceDetector {

  /**
   * @param {FaceDetectorOptions} options
   */
  constructor(options) {

    /**
     * @type {FaceDetectorOptions}
     * @private
     */
    this._options = options;
  }

  /**
   * @returns {boolean}
   */
  detectFace() {

  }

  /**
   * @returns {Promise<void>}
   */
  async loadModels() {

  }
}