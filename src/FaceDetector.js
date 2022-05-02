/**
 * @typedef {import('@/typings').FaceDetectorOptions} FaceDetectorOptions
 */

// import {
//   createCanvasFromMedia,
//   matchDimensions,
//   draw,
//   detectSingleFace,
//   resizeResults,
//   TinyFaceDetectorOptions,
//   nets
// }                    from 'face-api.js/build/es6';
import * as faceapi  from 'face-api.js';
import { execAsync } from '@/utils/execAsync';

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

    this._log2Console = options.log2Console;

    /**
     * @type {number}
     * @private
     */
    this._faceUndetectedTimeoutMs = this._options?.faceUndetectedTimeoutMs ?? 20000;

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
    this._videoInput = options.videoElement;

    /**
     * @type {HTMLCanvasElement}
     * @private
     */
    this._canvas = this._createHelperCanvas();

    /**
     * @type {null|number}
     * @private
     */
    this._faceDetectionIntervalId = null;

    /**
     * @type {Date|null}
     * @private
     */
    this._faceUndetectedDatetime = null;

    if ( this._options.activate ?? true ) {
      this.activate();
    }
  }

  /**
   * @param {string} content
   * @returns {void}
   * @private
   */
  _log(content) {
    if ( !this._log2Console ) {
      return;
    }

    console.log(content);
  }

  /**
   * @returns {Promise<import('face-api.js').FaceDetection | undefined>}
   * @private
   */
  async _detectSingleFace() {
    const detectSingleFaceTask = faceapi.detectSingleFace(this._videoInput, this._tinyFaceDetectorOptions);
    return await detectSingleFaceTask.run();
  }

  /**
   * @returns {{width: number, height: number}}
   * @private
   */
  _getVideoDisplaySize() {
    return {
      width: this._videoInput.width,
      height: this._videoInput.height
    };
  }

  /**
   * @returns {HTMLCanvasElement}
   * @private
   */
  _createHelperCanvas() {
    const canvas = faceapi.createCanvasFromMedia(this._videoInput);
    canvas.style.position = 'absolute';
    faceapi.matchDimensions(canvas, this._getVideoDisplaySize());
    document.body.append(canvas);
    return canvas;
  }

  /**
   * @param {any} detectData
   * @returns {void}
   * @private
   */
  async _drawDetections(detectData) {
    this._canvas
        .getContext('2d')
        .clearRect(0, 0, this._canvas.width, this._canvas.height);

    faceapi.draw.drawDetections(
      this._canvas,
      faceapi.resizeResults(detectData, this._getVideoDisplaySize())
    );
  }

  /**
   * @returns {Promise<void>}
   * @private
   */
  async _loadModels() {
    const modelsToLoaded = [];

    if ( !faceapi.nets.tinyFaceDetector.isLoaded ) {
      modelsToLoaded.push(
        faceapi.nets.tinyFaceDetector.loadFromUri(this._modelsUrl)
      );
    }

    await Promise.all(modelsToLoaded);
  }

  /**
   * @param {any} detectData
   * @private
   */
  _faceDetectedHandler(detectData) {
    // this._drawDetections(detectData);
    this._faceUndetectedDatetime = null;
    this._options.onFaceDetected?.();
  }

  /**
   * @returns {void}
   * @private
   */
  _faceUndetectedHandler() {
    if ( !this._faceUndetectedDatetime ) {
      this._faceUndetectedDatetime = new Date();
    }

    const timeout = (Date.now() - this._faceUndetectedDatetime.getTime());
    this._log(`faceUndetected timeout: ${ timeout }`);
    if ( timeout > this._faceUndetectedTimeoutMs ) {
      this._options.onFaceUndetected?.();
      this._faceUndetectedDatetime = null;
    }
  }

  /**
   * @returns {void}
   * @private
   */
  _destroyCanvas() {
    if ( this._canvas.parentElement ) {
      this._canvas.parentElement.removeChild(this._canvas);
    }

    this._canvas = null;
  }

  /**
   * @returns {void}
   */
  destroy() {
    this.deactivate();
    this._destroyCanvas();
  }

  /**
   * @returns {Promise<void>}
   * @public
   */
  async activate() {
    if ( this.isActive() ) {
      return;
    }

    const { error } = await execAsync(this._loadModels());

    if ( error ) {
      throw new Error('Failed to load face-api models ...');
    }

    this._tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 });

    // set the face detect
    const handler = async () => {
      const detectData = await this._detectSingleFace();
      if ( detectData ) {
        this._faceDetectedHandler(detectData);
      } else {
        this._faceUndetectedHandler();
      }
    };

    await handler();
    this._faceDetectionIntervalId = setInterval(
      handler,
      1000
    );
  }

  /**
   * @returns {void}
   * @public
   */
  deactivate() {
    clearInterval(this._faceDetectionIntervalId);
    this._tinyFaceDetectorOptions = null;
    this._faceDetectionIntervalId = null;
    this._faceUndetectedDatetime = null;
  }

  /**
   * @returns {boolean}
   * @public
   */
  isActive() {
    return this._faceDetectionIntervalId !== null;
  }

  // /**
  //  * @returns {Promise<void>}
  //  * @public
  //  */
  // async init() {
  //   const { error } = await execAsync(this._loadModels());
  //
  //   if ( error ) {
  //     throw new Error('Failed to load face-api models ...');
  //   }
  //
  //   this._tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 });
  //
  //   if ( this._options.activate ?? true ) {
  //     await this.activate();
  //   }
  // }
}