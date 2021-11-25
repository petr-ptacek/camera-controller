type FaceDetectorOptions = {
  modelsUrl: string;
  videoElement: HTMLVideoElement;
  faceUndetectedTimeoutMs?: number;
  activate?: boolean;

  onFaceUndetected?(): void;
  onFaceDetected?(): void;
}

export {
  FaceDetectorOptions
};