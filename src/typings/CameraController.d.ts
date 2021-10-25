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

type FileScreenshotOptions = ScreenshotOptions &
    { fileName?: string }

type CameraControllerOptions = {
  videoOptions?: VideoOptions;
  screenshotOptions?: ScreenshotOptions;
  faceDetectorOptions?: FaceDetectorOptions;

  onRecordingStart?: () => void;
  onRecordingEnd?: () => void;
  onRecordingInterrupted?: () => void;
  onDeviceNotAvailable?: () => void;
  onDevicePermissionDenied?: () => void;

  onFaceDetected?: () => void;
  onFaceUndetected?: () => void;
}

export {
  VideoOptions,
  ScreenshotOptions,
  FileScreenshotOptions,
  CameraControllerOptions
};