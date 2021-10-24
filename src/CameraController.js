/**
 * @typedef {import('@/typings').CameraControllerOptions} CameraControllerOptions
 * @typedef {import('@/typings').VideoOptions} VideoOptions
 * @typedef {import('@/typings').CanvasOptions} CanvasOptions
 */

import { attachElementToDom } from '@/utils/attachElementToDom';

export class CameraController {

  /**
   * @param {CameraControllerOptions} options
   */
  constructor(options = {}) {
    /**
     * @type {CameraControllerOptions}
     * @private
     */
    this._options = options;

    /**
     * @type {HTMLVideoElement}
     * @private
     */
    this._videoElement = this._createVideoElement();

    /**
     * @type {MediaStream|null}
     * @private
     */
    this._mediaStream = null;

    /**
     * @type {boolean}
     * @private
     */
    this._isRecording = false;
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

    return videoElement;
  }

  /**
   * @returns {Promise<MediaStream|null>}
   * @private
   */
  async _createMediaStream() {
    /** @type {MediaStream|null} */
    let mediaStream = null;

    const videoOptions = this._options.videoOptions ?? {};
    const videoWidth = typeof videoOptions.width === 'number' ?
      videoOptions.width :
      {
        min: 1280,
        max: 2560,
        ideal: 1280
      };
    const videoHeight = typeof videoOptions.height === 'number' ?
      videoOptions.height :
      {
        max: 1440,
        min: 720,
        ideal: 960
      };

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: videoWidth,
          height: videoHeight
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
   * @returns {void}
   * @public
   */
  stopRecording() {
    this._videoElement.pause();
    this._videoElement.srcObject = null;

    if ( this._mediaStream ) {
      this._mediaStream.getTracks().forEach(track => {
        if ( track.readyState === 'live' ) {
          track.stop();
        }
      });

      this._mediaStream = null;
    }

    if ( this._isRecording ) {
      this._options.onRecordingEnd?.();
    }

    this._isRecording = false;
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

    this._mediaStream = await this._createMediaStream();

    if ( this._mediaStream ) {
      this._videoElement.srcObject = this._mediaStream;
      this._options.onRecordingStart?.();
    }

    this._isRecording = !!this._mediaStream;
    return this._isRecording;
  }

  /**
   * @returns {string|null}
   * @public
   */
  getScreenshotBase64() {
    if ( !this._isRecording ) {
      return null;
    }

    const canvas = this._createCanvasElement({
      width: this._videoElement.videoWidth,
      height: this._videoElement.videoHeight
    });

    const ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      this._videoElement,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL('image/png', 1.0);
  }

  /**
   * @returns {Promise<HTMLImageElement|null>}
   */
  getScreenshotImg() {
    return new Promise((resolve, reject) => {
      const base64 = this.getScreenshotBase64();

      if ( !base64 ) {
        resolve(null);
      }

      const img = new Image();

      img.onload = () => {
        resolve(img);
      };

      img.onerror = (e) => {
        reject(e);
      };

      img.src = base64;

      if ( img.complete ) {
        delete img.onload;
        delete img.onerror;
        resolve(img);
      }
    });
  }

  /**
   * @param {HTMLElement|string} elementOrSelector
   * @returns {void}
   * @public
   */
  insertVideoElement(elementOrSelector) {
    attachElementToDom(this._videoElement, elementOrSelector);
  }

  /**
   * @returns {void}
   */
  removeVideoElement() {
    if ( this._videoElement.parentElement ) {
      this._videoElement.parentElement.removeChild(this._videoElement);
    }
  }
}