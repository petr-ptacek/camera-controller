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

    /**
     * @type {TinyFaceDetectorOptions|null}
     * @private
     */
    this._faceDetectorOptions = null;
  }

  /**
   * @param {HTMLImageElement} img
   * @returns {DetectSingleFaceTask}
   */
  _getFaceDetectionFromImg(img) {
    return faceapi.detectSingleFace(img, this._faceDetectorOptions);
  }

  /**
   * @param {HTMLImageElement} img
   * @returns {boolean}
   */
  isFaceDetected(img) {
    return !!this._getFaceDetectionFromImg(img);
  }

  /**
   * @returns {Promise<void>}
   */
  async loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/face-api-models');
  }

  async init() {
    await this.loadModels();
    this._faceDetectorOptions = new faceapi.TinyFaceDetectorOptions();
  }
}