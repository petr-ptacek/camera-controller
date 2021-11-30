/**
 * @typedef {import('@/typings').CameraControllerOptions} CameraControllerOptions
 * @typedef {import('@/typings').VideoOptions} VideoOptions
 * @typedef {import('@/typings').ScreenshotOptions} ScreenshotOptions
 * @typedef {import('@/typings').FileScreenshotOptions} FileScreenshotOptions
 * @typedef {import('@/typings').FaceDetectOptions} FaceDetectOptions
 * @typedef {import('@/typings').FaceDetectorOptions} FaceDetectorOptions
 * @typedef {import('@/typings').CanvasOptions} CanvasOptions
 * @typedef {import('@/typings').CallbackStartHandler} CallbackStartHandler
 * @typedef {import('@/typings').CallbackScreenshotBase64Handler} CallbackScreenshotBase64Handler
 * @typedef {import('@/typings').CallbackScreenshotImgHandler} CallbackScreenshotImgHandler
 * @typedef {import('@/typings').CallbackScreenshotFileHandler} CallbackScreenshotFileHandler
 * @typedef {import('@/typings').MediaPermissionHandlersMap} MediaPermissionHandlersMap
 */

import { FaceDetector } from '@/FaceDetector.js';
import { MediaChecker } from '@/MediaChecker.js';
import {
  createCanvas,
  blobToFile,
  base64ToBlob,
  resizeImg,
  resizeImgBasedAspectRatio,
  insertElementToDOM,
  createVideo
}                       from '@/utils';

export default class CameraController {

  /**
   * @param {CameraControllerOptions} [options]
   */
  constructor(options = {}) {
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
     * @type {FaceDetectOptions}
     * @private
     */
    this._faceDetectOptions = {
      faceUndetectedTimeoutMs: 20000,
      activate: true,
      ...(options.faceDetectOptions ?? {})
    };

    /**
     * @type {FaceDetector|null}
     * @private
     */
    this._faceDetector = null;

    /**
     * @type {HTMLVideoElement}
     * @private
     */
    this._videoBaseElement = null;

    /**
     * @type {HTMLVideoElement}
     * @private
     */
    this._videoScreenElement = null;

    /**
     * @type {(MediaStream|null)}
     * @private
     */
    this._mediaStream = null;

    /**
     * @type {boolean}
     * @private
     */
    this._isActive = false;
  }

  /**
   * @returns {boolean}
   */
  isActive() {
    return this._isActive;
  }

  isFaceDetectionActive() {
    return this._faceDetector && this._faceDetector.isActive();
  }

  /**
   * @param {function(available: boolean):void?} [cb]
   * @returns {Promise<boolean>}
   */
  static async isAccessPermissionGranted(cb) {
    if ( !CameraController.isSupportedCameraApi() ) {
      cb?.(false);
      return false;
    }

    const devices = await window.navigator.mediaDevices.enumerateDevices();
    const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
    let isGranted = false;

    for ( const videoInputDevice of videoInputDevices ) {
      if ( !!videoInputDevice.label ) {
        isGranted = true;
        break;
      }
    }

    cb?.(isGranted);
    return isGranted;
  }

  /**
   * @returns {boolean}
   * @static
   */
  static isSupportedCameraApi() {
    return (
      'mediaDevices' in navigator &&
      'getUserMedia' in navigator.mediaDevices &&
      'enumerateDevices' in navigator.mediaDevices
    );
  }

  /**
   * @param {function(available: boolean):void?} [cb]
   * @returns {Promise<boolean>}
   * @static
   */
  static async isAvailableCameraDevice(cb) {
    const isSupportedApi = CameraController.isSupportedCameraApi();

    const devices = await navigator.mediaDevices.enumerateDevices();
    const isAvailableVideoInput = !!devices.find(device => device.kind === 'videoinput');

    const isAvailable = isSupportedApi && isAvailableVideoInput;

    cb?.(isAvailable);
    return isAvailable;
  }

  /**
   * @returns {HTMLVideoElement}
   * @private
   */
  _createBaseVideoElement() {
    const videoElement = createVideo({ autoplay: false });
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
      this._createMediaStreamErrorHandler(error);
    }

    if ( mediaStream ) {
      const [mediaStreamTrack] = mediaStream.getTracks().filter(track => track.kind === 'video');

      mediaStreamTrack.onended = ev => {
        this._options.onRecordingInterrupted?.();
        this.stop();
      };
    }

    return mediaStream;
  }

  /**
   * @param {Error} error
   * @private
   */
  _createMediaStreamErrorHandler(error) {
    switch ( error.name ) {
      case 'NotAllowedError': {
        this._options.onDevicePermissionDenied?.();
        this.stop();
      }
        break;
      case 'NotFoundError': {
        this._options.onDeviceNotAvailable?.();
        this.stop();
      }
        break;
      case 'NotReadableError': {
        this._options.onDeviceNotReadable?.();
        this.stop();
      }
        break;
      default:
        this.stop();
        console.log(error);
    }
  }

  /**
   * @returns {Promise<string|null>}
   * @private
   */
  async _makeScreenshot() {
    if ( !this._isActive ) {
      return null;
    }

    const canvas = createCanvas({
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
   * @returns {void}
   * @private
   */
  _destroy() {
    this._destroyVideoScreen();
    this._destroyVideoBase();
    this._destroyMediaStream();
    this._destroyFaceDetector();
    this._isActive = false;
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
   * @private
   */
  _destroyFaceDetector() {
    if ( !this._faceDetector ) {
      return;
    }

    this._faceDetector.destroy();
    this._faceDetector = null;
  }

  /**
   * @param {Partial<FaceDetectorOptions>} [options]
   * @returns {FaceDetector}
   * @private
   */
  _createFaceDetector(options) {
    return new FaceDetector({
      videoElement: this._videoBaseElement,
      faceUndetectedTimeoutMs: this._faceDetectOptions.faceUndetectedTimeoutMs,
      modelsUrl: this._faceDetectOptions.modelsUrl,
      activate: options?.activate ?? this._faceDetectOptions.activate,

      /* handlers */
      onFaceUndetected: () => {
        this._options.onFaceUndetected?.();
      },
      onFaceDetected: () => {
        this._options.onFaceDetected?.();
      }
    });
  }

  /**
   * @returns {void}
   * @public
   */
  stop() {
    const isActive = this._isActive;

    this._destroy();

    if ( isActive ) {
      this._options.onRecordingEnd?.();
    }
  }

  /**
   * @param {MediaPermissionHandlersMap} handlers
   * @returns {Promise<boolean>}
   */
  static async checkPermissionsAndCompatibility(handlers) {
    return await MediaChecker.checkVideoPermissions(handlers);
  }

  /**
   * @param {CallbackStartHandler?} cb
   * @returns {Promise<boolean>}
   * @public
   */
  async start(cb) {
    if ( !await CameraController.isAvailableCameraDevice() ) {
      this._options.onDeviceNotAvailable?.();
      cb?.(false);
      return false;
    }

    // Create MediaStream
    this._mediaStream = await this._createMediaStream();

    if ( this._mediaStream ) {
      // Create VideoBase
      this._videoBaseElement = this._createBaseVideoElement();
      this._videoBaseElement.srcObject = this._mediaStream;
      document.body.append(this._videoBaseElement);
      await this._videoBaseElement.play();

      // Create FaceDetector
      this._faceDetector = this._createFaceDetector();

      // Create ScreenVideo
      this._videoScreenElement = createVideo();

      if ( this._videoOptions.elementOrSelector ) {
        this.insertVideoScreen(this._videoOptions.elementOrSelector);
      }

      this._isActive = true;
      cb?.(true);
      this._options.onRecordingStart?.();
    }

    if ( !this._mediaStream ) {
      this._isActive = false;
      this._destroy();
      cb?.(false);
    }

    return this._isActive;
  }

  /**
   * @returns {void}
   * @public
   */
  deactivateFaceDetection() {
    if ( !this._faceDetector ) {
      return;
    }

    this._faceDetector.deactivate();
  }

  /**
   * @param {function():void} [cb]
   * @returns {Promise<void>}
   */
  async activateFaceDetection(cb) {
    if ( !this._faceDetector ) {
      this._faceDetector = this._createFaceDetector({ activate: false });
    }

    await this._faceDetector.activate();
    cb?.();
  }

  /**
   * @param {CallbackScreenshotBase64Handler} [cb]
   * @param {ScreenshotOptions} [options]
   * @returns {Promise<string|null>}
   * @public
   */
  async getScreenshotAsBase64(cb, options = {}) {
    const base64 = (await this.getScreenshotAsImg(undefined, options))?.src ?? null;
    cb?.(base64);
    return base64;
  }

  /**
   * @param {CallbackScreenshotImgHandler} [cb]
   * @param {ScreenshotOptions} [options]
   * @returns {Promise<HTMLImageElement|null>}
   * @public
   */
  async getScreenshotAsImg(cb, options = {}) {
    const videoScreenshotBase64 = await this._makeScreenshot();

    if ( !videoScreenshotBase64 ) {
      cb?.(null);
      return null;
    }

    const _options = {
      useAspectRatio: this._screenshotOptions?.useAspectRatio,
      width: this._screenshotOptions?.width ?? this._videoBaseElement.videoWidth,
      height: this._screenshotOptions?.height ?? this._videoBaseElement.videoHeight,
      ...options
    };

    const img = _options.useAspectRatio ?
      await resizeImgBasedAspectRatio(videoScreenshotBase64, _options) :
      await resizeImg(videoScreenshotBase64, _options);

    cb?.(img);
    return img;
  }

  /**
   * @param {CallbackScreenshotFileHandler} [cb]
   * @param {FileScreenshotOptions} [options]
   * @returns {Promise<File|null>}
   * @public
   */
  async getScreenshotAsFile(cb, options) {
    const base64 = await this.getScreenshotAsBase64(options);

    if ( !base64 ) {
      cb?.(null);
      return null;
    }

    const blob = await base64ToBlob(base64);
    const file = blobToFile(blob, { fileName: `${ Date.now() }` });

    cb?.(file);
    return file;
  }

  /**
   * @returns {void}
   */
  showVideoBase() {
    this._videoBaseElement.style.cssText = this._videoBaseElement.dataset.cssVisible;
  }

  /**
   * @returns {void}
   */
  hideVideoBase() {
    this._videoBaseElement.style.cssText = this._videoBaseElement.dataset.cssHidden;
  }

  /**
   * @param {VideoOptions} [options]
   * @param {HTMLElement|string} elementOrSelector
   * @returns {void}
   * @public
   */
  insertVideoScreen(elementOrSelector, options = {}) {
    if ( !this._videoScreenElement || !this._mediaStream ) {
      return;
    }

    this.removeVideoScreen();

    const { width, height } = {
      width: this._videoOptions.width,
      height: this._videoOptions.height,
      ...(options || {})
    };

    this._videoScreenElement.width = width;
    this._videoScreenElement.height = height;
    this._videoScreenElement.srcObject = this._mediaStream;

    insertElementToDOM(this._videoScreenElement, elementOrSelector);
  }

  /**
   * @returns {void}
   * @public
   */
  removeVideoScreen() {
    if ( !this._videoScreenElement ) {
      return;
    }

    this._videoScreenElement.srcObject = null;
    if ( this._videoScreenElement.parentElement ) {
      this._videoScreenElement.parentElement.removeChild(this._videoScreenElement);
    }
  }
}