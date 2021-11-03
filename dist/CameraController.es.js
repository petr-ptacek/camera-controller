var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
async function execAsync(promise) {
  const result = { data: null, error: null };
  try {
    result.data = await promise;
  } catch (e) {
    result.error = e;
  }
  return result;
}
class FaceDetector {
  constructor(options) {
    var _a, _b;
    this._options = options;
    this._faceUndetectedTimeoutMs = (_b = (_a = this._options) == null ? void 0 : _a.faceUndetectedTimeoutMs) != null ? _b : 2e4;
    this._modelsUrl = options.modelsUrl;
    this._tinyFaceDetectorOptions = null;
    this._videoInput = options.videoElement;
    this._canvas = this._createHelperCanvas();
    this._faceDetectionIntervalId = null;
    this._faceUndetectedDatetime = null;
  }
  async _detectSingleFace() {
    return await faceapi.detectSingleFace(this._videoInput, this._tinyFaceDetectorOptions);
  }
  _getVideoDisplaySize() {
    return {
      width: this._videoInput.width,
      height: this._videoInput.height
    };
  }
  _createHelperCanvas() {
    const canvas = faceapi.createCanvasFromMedia(this._videoInput);
    canvas.style.position = "absolute";
    faceapi.matchDimensions(canvas, this._getVideoDisplaySize());
    document.body.append(canvas);
    return canvas;
  }
  async _drawDetections(detectData) {
    this._canvas.getContext("2d").clearRect(0, 0, this._canvas.width, this._canvas.height);
    faceapi.draw.drawDetections(this._canvas, faceapi.resizeResults(detectData, this._getVideoDisplaySize()));
  }
  async _loadModels() {
    const modelsToLoaded = [];
    if (!faceapi.nets.tinyFaceDetector.isLoaded) {
      modelsToLoaded.push(faceapi.nets.tinyFaceDetector.loadFromUri(this._modelsUrl));
    }
    await Promise.all(modelsToLoaded);
  }
  _faceDetectedHandler(detectData) {
    var _a, _b;
    this._faceUndetectedDatetime = null;
    (_b = (_a = this._options).onFaceDetected) == null ? void 0 : _b.call(_a);
  }
  _faceUndetectedHandler() {
    var _a, _b;
    if (!this._faceUndetectedDatetime) {
      this._faceUndetectedDatetime = new Date();
    }
    if (Date.now() - this._faceUndetectedDatetime.getTime() > this._faceUndetectedTimeoutMs) {
      (_b = (_a = this._options).onFaceUndetected) == null ? void 0 : _b.call(_a);
      this._faceUndetectedDatetime = null;
    }
  }
  _startFaceDetection() {
    this._faceDetectionIntervalId = setInterval(async () => {
      const detectData = await this._detectSingleFace();
      if (detectData) {
        this._faceDetectedHandler(detectData);
      } else {
        this._faceUndetectedHandler();
      }
    }, 1e3);
  }
  _stopFaceDetection() {
    clearInterval(this._faceDetectionIntervalId);
    this._faceDetectionIntervalId = null;
  }
  _destroyCanvas() {
    if (this._canvas.parentElement) {
      this._canvas.parentElement.removeChild(this._canvas);
    }
    this._canvas = null;
  }
  destroy() {
    this._stopFaceDetection();
    this._destroyCanvas();
  }
  async init() {
    const { error } = await execAsync(this._loadModels());
    if (error) {
      throw new Error("Failed to load face-api models ...");
    }
    this._tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 });
    this._startFaceDetection();
  }
}
function insertElementToDOM(element, elementOrSelector) {
  if (typeof elementOrSelector === "string") {
    document.querySelector(elementOrSelector).append(element);
  }
  if (elementOrSelector instanceof HTMLElement) {
    elementOrSelector.append(element);
  }
}
function base64ToBlob(base64, options = {}) {
  const [contentMetadata, contentData] = base64.split(",");
  const contentType = options.mimeType || contentMetadata.substring(contentMetadata.indexOf(":") + 1, contentMetadata.indexOf(";"));
  const byteCharacters = atob(contentData);
  const byteNumbers = Array.from({ length: byteCharacters.length });
  for (let index = 0, length = byteCharacters.length; index < length; index++) {
    byteNumbers[index] = byteCharacters.charCodeAt(index);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: contentType });
}
function blobToFile(blob, options) {
  return new File([blob], options.fileName, { type: options.mimeType || blob.type });
}
function calculateProportionsByAspectRatio(originWidth, originHeight, newWidth, newHeight) {
  let calculatedWidth = newWidth;
  let calculatedHeight = newHeight;
  if (newHeight > newWidth) {
    calculatedWidth = newHeight * originWidth / originHeight;
  } else {
    calculatedHeight = originHeight * newWidth / originWidth;
  }
  return {
    width: Math.round(calculatedWidth),
    height: Math.round(calculatedHeight)
  };
}
function createCanvas(options = {}) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (typeof options.width === "number") {
    canvas.width = options.width;
  }
  if (typeof options.height === "number") {
    canvas.height = options.height;
  }
  if (typeof options.bgColor === "string") {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fill();
  }
  return canvas;
}
async function createImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const clear = () => {
      delete img.onload;
      delete img.onerror;
    };
    img.onload = () => {
      clear();
      resolve(img);
    };
    img.onerror = (e) => {
      clear();
      reject(e);
    };
    img.src = src;
    if (img.complete) {
      clear();
      resolve(img);
    }
  });
}
function createVideo(options = {}) {
  var _a;
  const videoElement = document.createElement("video");
  videoElement.muted = true;
  videoElement.autoplay = (_a = options.autoplay) != null ? _a : true;
  if (typeof options.width === "number" && typeof options.height === "number") {
    videoElement.width = options.width;
    videoElement.height = options.height;
  }
  return videoElement;
}
async function resizeImg(imgOrBase64, options) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = imgOrBase64 instanceof HTMLImageElement ? imgOrBase64 : await createImg(imgOrBase64);
  canvas.width = options.width;
  canvas.height = options.height;
  ctx.drawImage(img, 0, 0, options.width, options.height);
  return await createImg(canvas.toDataURL(void 0, options.quality));
}
async function resizeImgBasedAspectRatio(imgOrBase64, options = {}) {
  var _a;
  let newWidth = 400;
  let newHeight = 400;
  const img = imgOrBase64 instanceof HTMLImageElement ? imgOrBase64 : await createImg(imgOrBase64);
  if (typeof options.width === "number" && typeof options.height === "number") {
    newWidth = options.width;
    newHeight = options.height;
  }
  if (typeof options.width === "number" && typeof options.height !== "number") {
    newWidth = options.width;
    newHeight = 0;
  }
  if (typeof options.height === "number" && typeof options.width !== "number") {
    newHeight = options.height;
    newWidth = 0;
  }
  const proportionsByAspectRatio = calculateProportionsByAspectRatio(img.naturalWidth, img.naturalHeight, newWidth, newHeight);
  return await resizeImg(img, {
    quality: (_a = options.quality) != null ? _a : 0.85,
    width: proportionsByAspectRatio.width,
    height: proportionsByAspectRatio.height
  });
}
class CameraController {
  constructor(options = {}) {
    var _a, _b, _c, _d, _e, _f, _g;
    this._options = options;
    this._videoOptions = __spreadValues({
      width: 200,
      height: 200
    }, (_a = options.videoOptions) != null ? _a : {});
    this._screenshotOptions = __spreadValues({
      useAspectRatio: true,
      quality: 0.85,
      width: (_c = (_b = this._videoOptions) == null ? void 0 : _b.width) != null ? _c : 400,
      height: (_e = (_d = this._videoOptions) == null ? void 0 : _d.height) != null ? _e : 400
    }, (_f = options.screenshotOptions) != null ? _f : {});
    this._faceDetectOptions = __spreadValues({
      faceUndetectedTimeoutMs: 2e4
    }, (_g = options.faceDetectOptions) != null ? _g : {});
    this._faceDetector = null;
    this._videoBaseElement = null;
    this._videoScreenElement = null;
    this._mediaStream = null;
    this._isActive = false;
  }
  isActive() {
    return this._isActive;
  }
  static isAvailableCameraDevice() {
    return "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices;
  }
  _createBaseVideoElement() {
    const videoElement = createVideo({ autoplay: false });
    videoElement.dataset.cssVisible = "";
    videoElement.dataset.cssHidden = "position:fixed;top:0;left:0;z-index:-10000;opacity:0;";
    videoElement.style.cssText = videoElement.dataset.cssHidden;
    return videoElement;
  }
  async _createMediaStream() {
    let mediaStream = null;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 960
        },
        audio: false
      });
    } catch (error) {
      this._createMediaStreamErrorHandler(error);
    }
    if (mediaStream) {
      const [mediaStreamTrack] = mediaStream.getTracks().filter((track) => track.kind === "video");
      mediaStreamTrack.onended = (ev) => {
        var _a, _b;
        (_b = (_a = this._options).onRecordingInterrupted) == null ? void 0 : _b.call(_a);
        this.stop();
      };
    }
    return mediaStream;
  }
  _createMediaStreamErrorHandler(error) {
    var _a, _b, _c, _d;
    switch (error.name) {
      case "NotAllowedError":
        {
          (_b = (_a = this._options).onDevicePermissionDenied) == null ? void 0 : _b.call(_a);
          this.stop();
        }
        break;
      case "NotFoundError":
        {
          (_d = (_c = this._options).onDeviceNotAvailable) == null ? void 0 : _d.call(_c);
          this.stop();
        }
        break;
      default:
        console.log(error);
    }
  }
  async _makeScreenshot() {
    if (!this._isActive) {
      return null;
    }
    const canvas = createCanvas({
      width: this._videoBaseElement.videoWidth,
      height: this._videoBaseElement.videoHeight
    });
    const ctx = canvas.getContext("2d");
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this._videoBaseElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png", 1);
  }
  _destroy() {
    this._destroyVideoScreen();
    this._destroyVideoBase();
    this._destroyMediaStream();
    this._destroyFaceDetector();
    this._isActive = false;
  }
  _destroyVideoBase() {
    if (!this._videoBaseElement) {
      return;
    }
    this._videoBaseElement.pause();
    this._videoBaseElement.srcObject = null;
    if (this._videoBaseElement.parentElement) {
      this._videoBaseElement.parentElement.removeChild(this._videoBaseElement);
    }
    this._videoScreenElement = null;
  }
  _destroyVideoScreen() {
    if (!this._videoScreenElement) {
      return;
    }
    this.removeVideoScreen();
    this._videoScreenElement = null;
  }
  _destroyMediaStream() {
    if (this._mediaStream) {
      this._mediaStream.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          track.stop();
        }
      });
    }
    this._mediaStream = null;
  }
  _destroyFaceDetector() {
    if (!this._faceDetector) {
      return;
    }
    this._faceDetector.destroy();
    this._faceDetector = null;
  }
  async _createFaceDetector() {
    const faceDetector = new FaceDetector({
      videoElement: this._videoBaseElement,
      faceUndetectedTimeoutMs: this._faceDetectOptions.faceUndetectedTimeoutMs,
      modelsUrl: this._faceDetectOptions.modelsUrl,
      onFaceUndetected: () => {
        var _a, _b;
        (_b = (_a = this._options).onFaceUndetected) == null ? void 0 : _b.call(_a);
      },
      onFaceDetected: () => {
        var _a, _b;
        (_b = (_a = this._options).onFaceDetected) == null ? void 0 : _b.call(_a);
      }
    });
    await faceDetector.init();
    return faceDetector;
  }
  stop() {
    var _a, _b;
    const isActive = this._isActive;
    this._destroy();
    if (isActive) {
      (_b = (_a = this._options).onRecordingEnd) == null ? void 0 : _b.call(_a);
    }
  }
  async start() {
    var _a, _b, _c, _d;
    if (!CameraController.isAvailableCameraDevice()) {
      (_b = (_a = this._options).onDeviceNotAvailable) == null ? void 0 : _b.call(_a);
      return false;
    }
    this._mediaStream = await this._createMediaStream();
    if (this._mediaStream) {
      this._videoBaseElement = this._createBaseVideoElement();
      this._videoBaseElement.srcObject = this._mediaStream;
      document.body.append(this._videoBaseElement);
      await this._videoBaseElement.play();
      this._faceDetector = await this._createFaceDetector();
      this._videoScreenElement = createVideo();
      if (this._videoOptions.elementOrSelector) {
        this.insertVideoScreen(this._videoOptions.elementOrSelector);
      }
      this._isActive = true;
      (_d = (_c = this._options).onRecordingStart) == null ? void 0 : _d.call(_c);
    }
    if (!this._mediaStream) {
      this._isActive = false;
      this._destroy();
    }
    return this._isActive;
  }
  async getScreenshotAsBase64(options = {}) {
    var _a, _b;
    return (_b = (_a = await this.getScreenshotAsImg(options)) == null ? void 0 : _a.src) != null ? _b : null;
  }
  async getScreenshotAsImg(options = {}) {
    var _a, _b, _c, _d, _e;
    const videoScreenshotBase64 = await this._makeScreenshot();
    if (!videoScreenshotBase64) {
      return null;
    }
    const _options = __spreadValues({
      useAspectRatio: (_a = this._screenshotOptions) == null ? void 0 : _a.useAspectRatio,
      width: (_c = (_b = this._screenshotOptions) == null ? void 0 : _b.width) != null ? _c : this._videoBaseElement.videoWidth,
      height: (_e = (_d = this._screenshotOptions) == null ? void 0 : _d.height) != null ? _e : this._videoBaseElement.videoHeight
    }, options);
    return _options.useAspectRatio ? await resizeImgBasedAspectRatio(videoScreenshotBase64, _options) : await resizeImg(videoScreenshotBase64, _options);
  }
  async getScreenshotAsFile(options) {
    const base64 = await this.getScreenshotAsBase64(options);
    if (!base64) {
      return null;
    }
    const blob = await base64ToBlob(base64);
    return blobToFile(blob, { fileName: `${Date.now()}` });
  }
  showVideoBase() {
    this._videoBaseElement.style.cssText = this._videoBaseElement.dataset.cssVisible;
  }
  hideVideoBase() {
    this._videoBaseElement.style.cssText = this._videoBaseElement.dataset.cssHidden;
  }
  insertVideoScreen(elementOrSelector, options = {}) {
    if (!this._videoScreenElement || !this._mediaStream) {
      return;
    }
    this.removeVideoScreen();
    const { width, height } = __spreadValues({
      width: this._videoOptions.width,
      height: this._videoOptions.height
    }, options || {});
    this._videoScreenElement.width = width;
    this._videoScreenElement.height = height;
    this._videoScreenElement.srcObject = this._mediaStream;
    insertElementToDOM(this._videoScreenElement, elementOrSelector);
  }
  removeVideoScreen() {
    if (!this._videoScreenElement) {
      return;
    }
    this._videoScreenElement.srcObject = null;
    if (this._videoScreenElement.parentElement) {
      this._videoScreenElement.parentElement.removeChild(this._videoScreenElement);
    }
  }
}
export { CameraController as default };
