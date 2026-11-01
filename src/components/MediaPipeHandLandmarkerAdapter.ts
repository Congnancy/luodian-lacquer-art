import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { publicAsset } from "../paths";

export class MediaPipeHandLandmarkerAdapter {
  private landmarker: HandLandmarker | null = null;

  async connect(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(publicAsset("/mediapipe/wasm"));
    this.landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: publicAsset("/models/hand_landmarker.task"),
        delegate: "CPU",
      },
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: 0.58,
      minHandPresenceConfidence: 0.58,
      minTrackingConfidence: 0.55,
    });
  }

  detect(video: HTMLVideoElement, timestamp: number): HandLandmarkerResult {
    if (!this.landmarker) {
      throw new Error("手部识别模型尚未加载。");
    }
    return this.landmarker.detectForVideo(video, timestamp);
  }

  close() {
    this.landmarker?.close();
    this.landmarker = null;
  }
}
