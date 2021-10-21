/**
 * @typedef CanvasOptions
 * @property {number|undefined} [width]
 * @property {number|undefined} [height]
 * @property {string|undefined} [bgColor]
 */

/**
 * @typedef VideoOptions
 * @property {Object} width
 * @property {number|undefined} width.max
 * @property {number|undefined} width.min
 * @property {number|undefined} width.ideal
 * @property {Object} height
 * @property {number|undefined} height.max
 * @property {number|undefined} height.min
 * @property {number|undefined} height.ideal
 */

/**
 * @typedef CameraControllerOptions
 * @property {VideoOptions} [videoOptions]
 * @property {Function|undefined} [onDeviceNotAllowed]
 * @property {Function|undefined} [onDeviceNotFound]
 * @property {Function|undefined} [onRecordingStart]
 * @property {Function|undefined} [onRecordingEnd]
 */

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
   * @return {boolean}
   */
  get isRecording() {
    return this._isRecording;
  }

  /**
   * @returns {boolean}
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

    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.createElement('canvas');

    if ( typeof options.width === 'number' ) {
      canvas.width = options.width;
    }

    if ( typeof options.height === 'number' ) {
      canvas.height = options.height;
    }

    /**
     * @type {CanvasRenderingContext2D}
     */
    const ctx = canvas.getContext('2d');

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

    videoElement.onplay = (ev) => {
      console.log('play');
    };

    videoElement.onerror = (ev) => {
      console.log('error');
    };

    return videoElement;
  }

  /**
   * @returns {Promise<MediaStream|null>}
   * @private
   */
  async _createMediaStream() {
    /**
     * @type {MediaStream|null}
     */
    let mediaStream = null;

    const { videoOptions } = this._options;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: {
            max: videoOptions?.width?.max ?? 2560,
            min: videoOptions?.width?.min ?? 1280,
            ideal: videoOptions?.width?.ideal ?? 1280
          },
          height: {
            max: videoOptions?.height?.max ?? 1440,
            min: videoOptions?.height?.min ?? 720,
            ideal: videoOptions?.height?.ideal ?? 960
          }
        },
        audio: false
      });
    } catch ( error ) {
      this._onCreateMediaStreamError(error);
    }

    if ( mediaStream ) {
      const [mediaStreamTrack] = mediaStream.getTracks().filter(track => track.kind === 'video');

      mediaStreamTrack.onended = ev => {
        debugger
        // this.stopRecording();
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
      case 'NotAllowedError':
        this._onNotAllowed(error);
        break;
      case 'NotFoundError':
        this._onNotFound(error);
        break;
      default:
        console.log(error);
    }
  }

  /**
   * @param {Error} error
   * @private
   */
  _onNotAllowed(error) {
    this.stopRecording();
    this._options.onDeviceNotAllowed?.();
  }

  /**
   * @param {Error} error
   * @private
   */
  _onNotFound(error) {
    this.stopRecording();
    this._options.onDeviceNotFound?.();
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

    this._options.onRecordingEnd?.();
    this._isRecording = false;
  }

  /**
   * @returns {Promise<boolean>}
   * @public
   */
  async startRecording() {
    if ( !CameraController.isAvailableCameraDevice() ) {
      this._options.onDeviceNotFound?.();
      return false;
    }

    this._mediaStream = await this._createMediaStream();

    if ( this._mediaStream ) {
      this._videoElement.srcObject = this._mediaStream;
      await this._videoElement.play();
      this._options.onRecordingStart?.();
    }

    this._isRecording = !!this._mediaStream;
    return this._isRecording;
  }

  /**
   * @returns {string|null}
   * @public
   */
  makeScreenshotBase64() {
    if ( !this._videoElement.played ) {
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
  makeScreenshotImg() {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve(img);
      };

      img.onerror = (e) => {
        reject(e);
      };

      img.src = this.makeScreenshotBase64();

      if ( img.complete ) {
        delete img.onload;
        delete img.onerror;
        resolve(img);
      }
    });
  }

  /**
   * @param {HTMLElement} element
   * @param {HTMLElement|string} elementOrSelector
   * @returns {void}
   * @private
   */
  _attachElement2DOM(element, elementOrSelector) {
    if ( typeof elementOrSelector === 'string' ) {
      document.querySelector(elementOrSelector).append(element);
    }

    if ( elementOrSelector instanceof HTMLElement ) {
      elementOrSelector.append(element);
    }
  }

  /**
   * @param {HTMLElement|string} elementOrSelector
   * @returns {void}
   * @public
   */
  attachVideoElement(elementOrSelector) {
    this._attachElement2DOM(this._videoElement, elementOrSelector);
  }
}