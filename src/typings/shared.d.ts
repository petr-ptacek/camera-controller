export type MediaPermissionHandlersMap = {
  onCameraApiNotSupported?: () => void;
  onDeviceNotFound?: (error: Error) => void;
  onUserPermissionDenied?: (error: Error) => void;
  onSystemPermissionDenied?: (error: Error) => void;
  onTrackError?: (error: Error) => void;
  onError?: (e: Error) => void;
}

export type CallbackStartHandler = (success: boolean) => void;

export type CallbackScreenshotBase64Handler = (base64: string | null) => void;

export type CallbackScreenshotImgHandler = (img: HTMLImageElement | null) => void;

export type CallbackScreenshotFileHandler = (file: File | null) => void;