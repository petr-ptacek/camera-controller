# Camera-controller

## How to include the library

In the html page insert the `script tag`

```html

<script src="camera-controller.umd.js"></script>
```

## Create the instance

In your `external js file` or in the `inline script`

```js
const cameraController = new CameraController(
  /** options */
)
```

## Options

```js
const cameraController = new CameraController({
  faceDetectOptions: {
    modelsUrl: new window.URL(`${ window.location.origin }/face-api-models`).toString()
  },
  videoOptions: {
    elementOrSelector: '#video-wrapper'
  },
  onRecordingStart() {
  },
  onRecordingEnd() {
  },
  onRecordingInterrupted() {
  },
  onDeviceNotAvailable() {
  },
  onDevicePermissionDenied() {
  },
  onFaceUndetected() {
  },
  onFaceDetected() {
  }
});
```

### faceDetectOptions

* `modelsUrl`
  - The url path where are the face-api-models located at the server

### videoOptions

* `elementOrSelector`
  * The Css selector of the element in which the video screen inserts

## Static Methods

* `CameraController.isAvailableCameraDevice(cb?: (available: boolean): void): Promise<boolean>`
  * for checking if the user has camera device and the browser support it

## Public Methods

* `isActive(): boolean`
  * indicates the camera active state (on/off)
* `start(): Promise<void>`
  * start the camera session
* `stop(): void`
  * end the camera session
* `getScreenshotAsBase64(cb?): Promise<string|null>`
  * get the screenshot as base64 or null if the camera is not active
    *it is possible to use `async/await` js features for working with asynchronous code or use callback style
* `getScreenshotAsImg(cb?): Promise<img|null>`
  * get the screenshot as img or null if the camera is not active
    *it is possible to use `async/await` js features for working with asynchronous code or use callback style
* `getScreenshotAsFile(cb?): Promise<File|null>`
  * get the screenshot as img or null if the camera is not active
    *it is possible to use `async/await` js features for working with asynchronous code or use callback style