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
  onRecordingStart?: () => void;
  onRecordingEnd?: () => void;
  onRecordingInterrupted?: () => void;
  onDeviceNotAvailable?: () => void;
  onDevicePermissionDenied?: () => void;
}

export {
  VideoOptions,
  ScreenshotOptions,
  FileScreenshotOptions,
  CameraControllerOptions
};