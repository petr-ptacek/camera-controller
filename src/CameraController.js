/**
 * @typedef {import('@/typings').CameraControllerOptions} CameraControllerOptions
 * @typedef {import('@/typings').VideoOptions} VideoOptions
 * @typedef {import('@/typings').ScreenshotOptions} ScreenshotOptions
 * @typedef {import('@/typings').FileScreenshotOptions} FileScreenshotOptions
 * @typedef {import('@/typings').CanvasOptions} CanvasOptions
 */

import { FaceDetector }              from '@/FaceDetector';
import { attachElementToDom }        from '@/utils/attachElementToDom';
import { resizeImgBasedAspectRatio } from '@/utils/resizeImgBasedAspectRatio';
import { resizeImg }                 from '@/utils/resizeImg';
import { base64ToBlob }              from '@/utils/base64ToBlob';
import { blobToFile }                from '@/utils/blobToFile';

export default class CameraController {

  /**
   * @param {CameraControllerOptions} [options]
   */
  constructor(options = {}) {
    /**
     * @type {FaceDetector}
     * @private
     */
    this._faceDetector = new FaceDetector({
      modelsUrl: options.faceDetectOptions.modelsUrl
    });

    /**
     * @type {CameraControllerOptions}
     * @private
     */
    this._options = options;

    /**
     * @type {VideoOptions}
     * @private
     */
    this._videoOptions = {
      width: 200,
      height: 200,
      ...(options.videoOptions ?? {})
    };

    /**
     * @type {ScreenshotOptions}
     * @private
     */
    this._screenshotOptions = {
      useAspectRatio: true,
      quality: 0.85,
      width: this._videoOptions?.width ?? 400,
      height: this._videoOptions?.height ?? 400,
      ...(options.screenshotOptions ?? {})
    };

    /**
     * @type {HTMLVideoElement}
     * @private
     */
    this._videoBaseElement = null;//this._createBaseVideoElement();

    /**
     * @type {HTMLVideoElement}
     * @private
     */
    this._videoScreenElement = null;//this._createVideoElement();

    /**
     * @type {(MediaStream|null)}
     * @private
     */
    this._mediaStream = null;

    /**
     * @type {boolean}
     * @private
     */
    this._isRecording = false;

    /**
     * @type {boolean}
     * @private
     */
    this._isActiveFaceDetection = false;
  }

  /**
   * @returns {MediaStream|null}
   */
  get mediaStream() {
    return this._mediaStream;
  }

  /**
   * @return {boolean}
   */
  get isRecording() {
    return this._isRecording;
  }

  /**
   * @returns {boolean}
   * @static
   */
  static isAvailableCameraDevice() {
    return (
      'mediaDevices' in navigator &&
      'getUserMedia' in navigator.mediaDevices
    );
  }

  /**
   * @return {Promise<boolean>}
   * @private
   */
  async _detectFace() {
    return await this._faceDetector.detect(this._videoBaseElement);
  }

  async _detectFaceGraphically() {
    return this._faceDetector;
  }

  /**
   * @param {CanvasOptions} [options]
   * @returns {HTMLCanvasElement}
   * @private
   */
  _createCanvasElement(options = {}) {

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

  /**
   * @param {VideoOptions} [options]
   * @returns {HTMLVideoElement}
   * @private
   */
  _createVideoElement(options = {}) {
    /**
     * @type {HTMLVideoElement}
     */
    const videoElement = document.createElement('video');
    videoElement.muted = true;
    videoElement.autoplay = true;

    if ( typeof options.width === 'number' && typeof options.height === 'number' ) {
      videoElement.width = options.width;
      videoElement.height = options.height;
    }

    return videoElement;
  }

  /**
   * @returns {HTMLVideoElement}
   * @private
   */
  _createBaseVideoElement() {
    const videoElement = this._createVideoElement();
    videoElement.dataset.cssVisible = '';
    videoElement.dataset.cssHidden = 'position:fixed;top:0;left:0;z-index:-10000;opacity:0;';
    videoElement.style.cssText = videoElement.dataset.cssHidden;
    return videoElement;
  }

  /**
   * @returns {Promise<MediaStream|null>}
   * @private
   */
  async _createMediaStream() {
    /** @type {MediaStream|null} */
    let mediaStream = null;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 960
        },
        audio: false
      });
    } catch ( error ) {
      this._onCreateMediaStreamError(error);
    }

    if ( mediaStream ) {
      const [mediaStreamTrack] = mediaStream.getTracks().filter(track => track.kind === 'video');

      mediaStreamTrack.onended = ev => {
        this._options.onRecordingInterrupted?.();
        this.stopRecording();
      };
    }

    return mediaStream;
  }

  /**
   * @param {Error} error
   * @private
   */
  _onCreateMediaStreamError(error) {
    switch ( error.name ) {
      case 'NotAllowedError': {
        this._options.onDevicePermissionDenied?.();
        this.stopRecording();
      }
        break;
      case 'NotFoundError': {
        this._options.onDeviceNotAvailable?.();
        this.stopRecording();
      }
        break;
      default:
        console.log(error);
    }
  }

  /**
   * @returns {Promise<string|null>}
   * @private
   */
  async _makeScreenshot() {
    if ( !this._isRecording ) {
      return null;
    }

    const canvas = this._createCanvasElement({
      width: this._videoBaseElement.videoWidth,
      height: this._videoBaseElement.videoHeight
    });

    const ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      this._videoBaseElement,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL('image/png', 1.0);
  }

  /**
   * @private
   */
  _destroy() {
    this._destroyVideoScreen();
    this._destroyVideoBase();
    this._destroyMediaStream();
  }

  /**
   * @returns {void}
   * @private
   */
  _destroyVideoBase() {
    if ( !this._videoBaseElement ) {
      return;
    }

    this._videoBaseElement.pause();
    this._videoBaseElement.srcObject = null;

    if ( this._videoBaseElement.parentElement ) {
      this._videoBaseElement.parentElement.removeChild(this._videoBaseElement);
    }

    this._videoScreenElement = null;
  }

  /**
   * @returns {void}
   * @private
   */
  _destroyVideoScreen() {
    if ( !this._videoScreenElement ) {
      return;
    }

    this.removeVideoScreen();

    this._videoScreenElement = null;
  }

  /**
   * @returns {void}
   * @private
   */
  _destroyMediaStream() {
    if ( this._mediaStream ) {
      this._mediaStream.getTracks().forEach(track => {
        if ( track.readyState === 'live' ) {
          track.stop();
        }
      });
    }

    this._mediaStream = null;
  }

  /**
   * @returns {void}
   * @public
   */
  stopRecording() {
    this._destroy();

    if ( this._isRecording ) {
      this._options.onRecordingEnd?.();
    }

    this._isRecording = false;
  }

  showBaseVideoElement() {
    this._videoBaseElement.style.cssText = '';
  }

  hideBaseVideoElement() {
    this._videoBaseElement.style.cssText = this._videoBaseElement.dataset.cssHidden;
  }

  /**
   * @returns {Promise<boolean>}
   * @public
   */
  async startRecording() {
    if ( !CameraController.isAvailableCameraDevice() ) {
      this._options.onDeviceNotAvailable?.();
      return false;
    }

    // Create MediaStream
    this._mediaStream = await this._createMediaStream();

    if ( this._mediaStream ) {
      // Create VideoBase
      this._videoBaseElement = this._createBaseVideoElement();
      this._videoBaseElement.srcObject = this._mediaStream;
      document.body.append(this._videoBaseElement);

      // Create ScreenVideo
      this._videoScreenElement = this._createVideoElement();

      if ( this._videoOptions.elementOrSelector ) {
        this.insertVideoScreen(this._videoOptions.elementOrSelector);
      }

      this._options.onRecordingStart?.();
    }

    if ( !this._mediaStream ) {
      this._destroy();
    }

    this._isRecording = !!this._mediaStream;
    return this._isRecording;
  }

  /**
   * @param {ScreenshotOptions} [options]
   * @returns {Promise<string|null>}
   * @public
   */
  async getScreenshotAsBase64(options = {}) {
    return (await this.getScreenshotAsImg(options))?.src ?? null;
  }

  /**
   * @param {ScreenshotOptions} [options]
   * @returns {Promise<HTMLImageElement|null>}
   * @public
   */
  async getScreenshotAsImg(options = {}) {
    const videoScreenshotBase64 = await this._makeScreenshot();

    if ( !videoScreenshotBase64 ) {
      return null;
    }

    const _options = {
      useAspectRatio: this._screenshotOptions?.useAspectRatio,
      width: this._screenshotOptions?.width ?? this._videoBaseElement.videoWidth,
      height: this._screenshotOptions?.height ?? this._videoBaseElement.videoHeight,
      ...options
    };

    return _options.useAspectRatio ?
      await resizeImgBasedAspectRatio(videoScreenshotBase64, _options) :
      await resizeImg(videoScreenshotBase64, _options);
  }

  /**
   * @param {FileScreenshotOptions} [options]
   * @returns {Promise<File|null>}
   * @public
   */
  async getScreenshotAsFile(options) {
    const base64 = await this.getScreenshotAsBase64(options);

    if ( !base64 ) {
      return null;
    }

    const blob = await base64ToBlob(base64);
    return blobToFile(blob, { fileName: `${ Date.now() }` });
  }

  /**
   * @param {VideoOptions} [options]
   * @param {HTMLElement|string} elementOrSelector
   * @returns {void}
   * @public
   */
  insertVideoScreen(elementOrSelector, options = {}) {
    this.removeVideoScreen();

    const { width, height } = {
      width: this._videoOptions.width,
      height: this._videoOptions.height,
      ...(options || {})
    };

    this._videoScreenElement.width = width;
    this._videoScreenElement.height = height;
    this._videoScreenElement.srcObject = this._mediaStream;

    attachElementToDom(this._videoScreenElement, elementOrSelector);
  }

  /**
   * @returns {void}
   * @public
   */
  removeVideoScreen() {
    this._videoScreenElement.srcObject = null;
    if ( this._videoScreenElement.parentElement ) {
      this._videoScreenElement.parentElement.removeChild(this._videoScreenElement);
    }
  }
}