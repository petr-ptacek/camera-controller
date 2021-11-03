type FaceDetectorOptions = {
  modelsUrl: string;
  videoElement: HTMLVideoElement;
  faceUndetectedTimeoutMs?: number;

  onFaceUndetected?(): void;
  onFaceDetected?(): void;
}

export {
  FaceDetectorOptions
};