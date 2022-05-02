type FaceDetectorOptions = {
  modelsUrl: string;
  videoElement: HTMLVideoElement;
  faceUndetectedTimeoutMs?: number;
  activate?: boolean;
  log2Console?: boolean;

  onFaceUndetected?(): void;
  onFaceDetected?(): void;
}

export {
  FaceDetectorOptions
};