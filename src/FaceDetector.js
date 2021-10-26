/**
 * @typedef {import('@/typings').FaceDetectorOptions} FaceDetectorOptions
 */

import { execAsync } from '@/utils/execAsync';

export class FaceDetector {

  /**
   * @param {FaceDetectorOptions} options
   */
  constructor(options) {

    /**
     * @type {string}
     * @private
     */
    this._modelsUrl = options.modelsUrl;

    /**
     * @type {any|null}
     * @private
     */
    this._tinyFaceDetectorOptions = null;

    /**
     * @type {HTMLVideoElement}
     * @private
     */
    this._videoInput = options.videoInput;

    /**
     * @type {HTMLCanvasElement}
     * @private
     */
    this._canvas = null;
  }

  /**
   * @returns {DetectSingleFaceTask}
   * @private
   */
  async _detectSingleFace() {
    return await faceapi.detectSingleFace(this._videoInput, this._tinyFaceDetectorOptions);
  }

  /**
   * @returns {void}
   * @public
   */
  async drawDetectionBox() {
    const detection = await this._detectSingleFace();

    if ( !detection ) {
      return;
    }

    if ( !this._canvas ) {
      this._canvas = faceapi.createCanvasFromMedia(input);
      this._canvas.style.position = 'absolute';
      document.body.append(this._canvas);
    }

    this._canvas
        .getContext('2d')
        .clearRect(0, 0, this._canvas.width, this._canvas.height);

    faceapi.matchDimensions(this._canvas, { width: this.i });
    faceapi.draw.drawDetections(this._canvas, faceapi.resizeResults(faceDetection, input));
  }

  /**
   * @returns {Promise<void>}
   * @public
   */
  async loadModels() {
    const modelsToLoaded = [];

    if ( !faceapi.nets.tinyFaceDetector.isLoaded ) {
      modelsToLoaded.push(
        faceapi.nets.tinyFaceDetector.loadFromUri(this._modelsUrl)
      );
    }

    await Promise.all(modelsToLoaded);
  }

  /**
   * @returns {void}
   */
  destroy() {

  }

  /**
   * @returns {Promise<void>}
   * @public
   */
  async init() {
    const { error } = await execAsync(this.loadModels());

    if ( error ) {
      throw new Error('Failed to load face-api models ...');
    }


    this._tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 });
  }
}