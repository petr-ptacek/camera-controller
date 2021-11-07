export type CallbackHandler = () => void;

export type CallbackScreenshotBase64Handler = (base64: string | null) => void;

export type CallbackScreenshotImgHandler = (img: HTMLImageElement | null) => void;

export type CallbackScreenshotFileHandler = (file: File | null) => void;