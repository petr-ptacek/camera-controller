import { FaceDetectorOptions } from './FaceDetector';

type VideoOptions = {
  width?: number;
  height?: number;
  elementOrSelector?: HTMLElement | string;
}

type ScreenshotOptions = {
  width?: number;
  height?: number;
  quality?: number;
  useAspectRatio?: boolean;
}

type FileScreenshotOptions = ScreenshotOptions & { fileName?: string }

type FaceDetectOptions =
  Pick<FaceDetectorOptions, 'modelsUrl'> &
  Partial<Pick<FaceDetectorOptions, 'faceUndetectedTimeoutMs'>> &
  Partial<Pick<FaceDetectorOptions, 'activate'>>

type CameraControllerOptions = {
  videoOptions?: VideoOptions;
  screenshotOptions?: ScreenshotOptions;
  faceDetectOptions?: FaceDetectOptions;

  onRecordingStart?: () => void;
  onRecordingEnd?: () => void;
  onRecordingInterrupted?: () => void;

  onDeviceNotAvailable?: () => void;
  onDevicePermissionDenied?: () => void;
  onDeviceNotReadable?: () => void;
  onDeviceSwitch?: () => void;

  onFaceDetected?: () => void;
  onFaceUndetected?: () => void;

  log2Console?: boolean;
}

export {
  VideoOptions,
  ScreenshotOptions,
  FileScreenshotOptions,
  CameraControllerOptions,
  FaceDetectOptions
};