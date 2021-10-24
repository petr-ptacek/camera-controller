type VideoOptions = {
  class?: string;
  id?: string;
  width?: {
    max?: number;
    min?: number;
    ideal?: number;
  } | number;
  height?: {
    max?: number;
    min?: number;
    ideal?: number;
  } | number;
}

type ScreenshotOptions = {
  width?: number;
  height?: number;
  useAspectRatio?: boolean;
}

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
  CameraControllerOptions
};