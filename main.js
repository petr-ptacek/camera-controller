import './style.css';
import { CameraController } from '@/CameraController.js';

const btnCameraOn = document.getElementById('btn-camera-on');
const btnCameraOff = document.getElementById('btn-camera-off');
const btnScreenshot = document.getElementById('btn-make-screenshot');
const cameraController = new CameraController({
  videoOptions: {
    width: 400,
    height: 300
  },
  onRecordingStart() {
    cameraController.insertVideoElement('#video-wrapper');
  },
  onRecordingEnd() {
    cameraController.removeVideoElement();
  },
  onRecordingInterrupted() {
    console.log('Recording Interrupted!');
  },
  onDeviceNotAvailable() {
    console.log('Device not available!');
  },
  onDevicePermissionDenied() {
    console.log('Device permission denied!');
  }
});

function startCamera() {
  cameraController.startRecording();
}

function stopCamera() {
  cameraController.stopRecording();
}

async function makeScreenshot() {
  const screenshotImg = await cameraController.getScreenshotImg();

  if ( screenshotImg ) {
    document.getElementById('screenshot-chunk').innerHTML = '';
    document.getElementById('screenshot-chunk').append(screenshotImg);
  }
}

btnCameraOn.addEventListener('click', startCamera);
btnCameraOff.addEventListener('click', stopCamera);
btnScreenshot.addEventListener('click', makeScreenshot);