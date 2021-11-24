import './style.css';
import CameraController from '@/CameraController.js';

const btnCameraOn = document.getElementById('btn-camera-on');
const btnCameraOff = document.getElementById('btn-camera-off');
const btnScreenshotAsBase64 = document.getElementById('btn-make-screenshot-base64');
const btnScreenshotAsImg = document.getElementById('btn-make-screenshot-img');
const btnScreenshotAsFile = document.getElementById('btn-make-screenshot-file');
const btnCheckCameraPermission = document.getElementById('btn-is-enabled-camera-permission');

const cameraController = new CameraController({
  faceDetectOptions: {
    modelsUrl: new window.URL(`${ window.location.origin }/face-api-models`).toString()
  },
  videoOptions: {
    elementOrSelector: '#video-wrapper'
  },
  onRecordingStart() {
    console.log('Recording start!');
  },
  onRecordingEnd() {
    console.log('Recording end!');
  },
  onRecordingInterrupted() {
    console.log('Recording Interrupted!');
  },
  onDeviceNotAvailable() {
    console.log('Device not available!');
  },
  onDevicePermissionDenied() {
    console.log('Device permission denied!');
  },
  onDeviceNotReadable() {
    console.log('Device not readable!');
  },
  onFaceUndetected() {
    console.log('faceUndetected');
    onFaceUndetectedHandler();
  },
  onFaceDetected() {
    console.log('faceDetected');
    onFaceDetectedHandler();
  }
});

function startCamera() {
  cameraController.start();
}

function stopCamera() {
  cameraController.stop();
  document.getElementById('screenshot-chunk').innerHTML = '';
  document.body.style.backgroundColor = '';
}

async function makeScreenshotImg() {
  // const screenshotImg = await cameraController.getScreenshotAsImg();
  //
  // if ( screenshotImg ) {
  //   document.getElementById('screenshot-chunk').innerHTML = '';
  //   document.getElementById('screenshot-chunk').append(screenshotImg);
  // }

  cameraController.getScreenshotAsImg(screenshotImg => {
    if ( screenshotImg ) {
      document.getElementById('screenshot-chunk').innerHTML = '';
      document.getElementById('screenshot-chunk').append(screenshotImg);
    }
  });
}

function onFaceDetectedHandler() {
  document.body.style.backgroundColor = 'green';
}

function onFaceUndetectedHandler() {
  document.body.style.removeProperty('background-color');
}

async function makeScreenshotFile() {
  // const file = await cameraController.getScreenshotAsFile();
  // console.dir(file);

  cameraController.getScreenshotAsFile(
    (file) => {
      console.dir(file);
    }
  );
}

async function makeScreenshotBase64() {
  // const screenshotBase64 = await cameraController.getScreenshotAsBase64();
  //
  // if ( screenshotBase64 ) {
  //   const img = new Image();
  //   img.src = screenshotBase64;
  //
  //   document.getElementById('screenshot-chunk').innerHTML = '';
  //   document.getElementById('screenshot-chunk').append(img);
  // }

  cameraController.getScreenshotAsBase64(screenshotBase64 => {
    if ( screenshotBase64 ) {
      const img = new Image();
      img.src = screenshotBase64;

      document.getElementById('screenshot-chunk').innerHTML = '';
      document.getElementById('screenshot-chunk').append(img);
    }
  });
}

async function checkCameraAccessPermission() {
  const granted = await CameraController.isAccessPermissionGranted(null);
  console.log(`CameraAccessPermission: ${ granted }`);
}

btnCheckCameraPermission.addEventListener('click', checkCameraAccessPermission);
btnCameraOn.addEventListener('click', startCamera);
btnCameraOff.addEventListener('click', stopCamera);
btnScreenshotAsBase64.addEventListener('click', makeScreenshotBase64);
btnScreenshotAsImg.addEventListener('click', makeScreenshotImg);
btnScreenshotAsFile.addEventListener('click', makeScreenshotFile);