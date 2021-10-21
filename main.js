import './style.css';
import { CameraController }          from './CameraController.js';
import { base64ToBlob }              from './utils/base64ToBlob';
import { blobToFile }                from './utils/blobToFile';
import { download }                  from './utils/download';
import { shrinkImgBasedAspectRatio } from './utils/shrinkImgBasedAspectRatio.js';

const cameraController = new CameraController({
  onDeviceNotFound: () => {
    console.log('device not found');
  },
  onDeviceNotAllowed: () => {
    console.log('device not allowed');
  },
  onDeviceDisabled: () => {
    console.log('device disabled');
  }
});
/**
 * @type {HTMLButtonElement}
 */
const btnRecordingStart = document.getElementById('btn-recording-start');

/**
 * @type {HTMLButtonElement}
 */
const btnRecordingStop = document.getElementById('btn-recording-stop');

/**
 * @type {HTMLButtonElement}
 */
const btnMakeScreenshot = document.getElementById('btn-make-screenshot');


cameraController.attachVideoElement('#video');

btnRecordingStart.addEventListener('click', () => {
  cameraController.startRecording();
});

btnRecordingStop.addEventListener('click', () => {
  cameraController.stopRecording();
});

btnMakeScreenshot.addEventListener('click', async () => {
  const screenshot = await cameraController.makeScreenshotImg();

  const file = blobToFile(
    base64ToBlob(screenshot.src),
    { fileName: 'screenshot' }
  );

  document.getElementById('screenshot').innerHTML = '';
  document.getElementById('screenshot').append(screenshot);

  const shrinkImg = await shrinkImgBasedAspectRatio(
    screenshot
  );

  document.getElementById('screenshot-shrink').innerHTML = '';
  document.getElementById('screenshot-shrink').append(shrinkImg);
});