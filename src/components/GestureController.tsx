import { useEffect, useRef, useState } from "react";
import { HandLandmarker, type NormalizedLandmark } from "@mediapipe/tasks-vision";
import { MediaPipeHandLandmarkerAdapter } from "./MediaPipeHandLandmarkerAdapter";
import { MOTIFS } from "../types";

export type CameraStatus =
  | "requesting"
  | "loading"
  | "searching"
  | "hand-detected"
  | "tracking"
  | "no-hand"
  | "denied"
  | "unavailable"
  | "error"
  | "off";

export interface HandGestureState {
  x: number;
  y: number;
  indexX: number;
  indexY: number;
  openPalm: boolean;
  indexFinger: boolean;
  pinch: boolean;
}

interface GestureControllerProps {
  step: number;
  inputMode: "camera" | "mouse";
  onModeChange: (mode: "camera" | "mouse") => void;
  onStatusChange: (status: CameraStatus) => void;
  onGestureChange: (gesture: HandGestureState | null) => void;
}

interface CameraDeviceOption {
  deviceId: string;
  label: string;
}

const STATUS_LABELS: Record<CameraStatus, string> = {
  requesting: "正在请求摄像头权限…",
  loading: "正在加载本地手势识别模型…",
  searching: "电脑摄像头已连接，请将手放入画面",
  "hand-detected": "检测到手部，请按本步提示张开手掌或捏合",
  tracking: "已识别到手部动作",
  "no-hand": "摄像头已连接 · 暂未识别到手，请调整手的位置",
  denied: "摄像头权限被拒绝，可切换鼠标模拟",
  unavailable: "未找到可用摄像头，可切换鼠标模拟",
  error: "摄像头启动失败，请检查权限或设备占用",
  off: "摄像头已关闭",
};

const HAND_CONNECTIONS = HandLandmarker.HAND_CONNECTIONS;

function distance(a: NormalizedLandmark, b: NormalizedLandmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function readGesture(landmarks: NormalizedLandmark[]): HandGestureState {
  const wrist = landmarks[0];
  const palmWidth = Math.max(distance(landmarks[5], landmarks[17]), 0.001);
  const fingerTips = [8, 12, 16, 20];
  const fingerJoints = [6, 10, 14, 18];
  const extendedFingers = fingerTips.filter(
    (tip, index) =>
      distance(landmarks[tip], wrist) >
      distance(landmarks[fingerJoints[index]], wrist) * 1.12,
  ).length;
  const indexExtended = distance(landmarks[8], wrist) > distance(landmarks[6], wrist) * 1.12;
  const otherFingersClosed = [12, 16, 20].every(
    (tip, index) =>
      distance(landmarks[tip], wrist) <=
      distance(landmarks[[10, 14, 18][index]], wrist) * 1.12,
  );
  const pinch = distance(landmarks[4], landmarks[8]) < palmWidth * 0.42;
  const openPalm = extendedFingers >= 4 && !pinch;

  return {
    x: 1 - landmarks[0].x,
    y: landmarks[0].y,
    indexX: 1 - landmarks[8].x,
    indexY: landmarks[8].y,
    openPalm,
    indexFinger: indexExtended && otherFingersClosed,
    pinch,
  };
}

function smoothGesture(
  previous: HandGestureState | null,
  next: HandGestureState,
): HandGestureState {
  if (!previous) return next;
  const blend = (oldValue: number, newValue: number) =>
    oldValue * 0.62 + newValue * 0.38;
  return {
    x: blend(previous.x, next.x),
    y: blend(previous.y, next.y),
    indexX: blend(previous.indexX, next.indexX),
    indexY: blend(previous.indexY, next.indexY),
    openPalm: next.openPalm,
    indexFinger: next.indexFinger,
    pinch: next.pinch,
  };
}

function getCameraErrorStatus(error: unknown): CameraStatus {
  if (!(error instanceof DOMException)) return "error";
  if (error.name === "NotAllowedError" || error.name === "SecurityError") {
    return "denied";
  }
  if (
    error.name === "NotFoundError" ||
    error.name === "DevicesNotFoundError" ||
    error.name === "OverconstrainedError"
  ) {
    return "unavailable";
  }
  return "error";
}

export function GestureController({
  step,
  inputMode,
  onModeChange,
  onStatusChange,
  onGestureChange,
}: GestureControllerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [cameraAttempt, setCameraAttempt] = useState(0);
  const [status, setStatus] = useState<CameraStatus>("requesting");
  const [detail, setDetail] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [cameraDevices, setCameraDevices] = useState<CameraDeviceOption[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [handLandmarks, setHandLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const fallbackFromBusyDevice = useRef(false);
  const fallbackNotice = useRef("");
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    let cancelled = false;
    let animationFrame = 0;
    let stream: MediaStream | null = null;
    let adapter: MediaPipeHandLandmarkerAdapter | null = null;
    let lastDetect = 0;
    let missingHandFrames = 0;
    let stableOpenFrames = 0;
    let stablePinchFrames = 0;
    let smoothed: HandGestureState | null = null;
    let availableDevices: CameraDeviceOption[] = [];

    function updateStatus(next: CameraStatus, message = "") {
      if (cancelled) return;
      setStatus(next);
      setDetail(message);
      onStatusChange(next);
    }

    async function startCamera() {
      if (!cameraEnabled) {
        updateStatus("off");
        onGestureChange(null);
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        updateStatus("unavailable", "请在 localhost 或 HTTPS 页面中使用支持摄像头的浏览器。");
        onModeChange("mouse");
        return;
      }

      updateStatus("requesting");
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: selectedDeviceId
            ? {
                deviceId: { exact: selectedDeviceId },
                width: { ideal: 640 },
                height: { ideal: 480 },
              }
            : {
                facingMode: "user",
                width: { ideal: 640 },
                height: { ideal: 480 },
              },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const activeTrack = stream.getVideoTracks()[0];
        const activeDeviceId = activeTrack?.getSettings().deviceId ?? "";
        const devices = (await navigator.mediaDevices.enumerateDevices())
          .filter((device) => device.kind === "videoinput")
          .map((device) => ({ deviceId: device.deviceId, label: device.label || "摄像头" }));
        availableDevices = devices;
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        setCameraDevices(devices);
        if (!selectedDeviceId && !fallbackFromBusyDevice.current) {
          const preferredDevice = devices.find(
            (device) => !/虚拟摄像头|virtual camera/i.test(device.label),
          );
          const nextDeviceId = preferredDevice?.deviceId || activeDeviceId;
          if (nextDeviceId && nextDeviceId !== activeDeviceId) {
            stream.getTracks().forEach((track) => track.stop());
            stream = null;
            setSelectedDeviceId(nextDeviceId);
            return;
          }
          if (activeDeviceId) setSelectedDeviceId(activeDeviceId);
        }
        const activeDeviceName = activeTrack?.label || "默认摄像头";
        setDeviceName(activeDeviceName);

        const video = videoRef.current;
        if (!video) throw new Error("摄像头预览区域尚未准备好。");
        video.srcObject = stream;
        await video.play();

        updateStatus("loading");
        adapter = new MediaPipeHandLandmarkerAdapter();
        await adapter.connect();
        if (cancelled) {
          adapter.close();
          return;
        }

        updateStatus(
          "searching",
          fallbackNotice.current
            ? `${fallbackNotice.current} 当前使用「${activeDeviceName}」。`
            : "",
        );
        const detectFrame = (now: number) => {
          if (cancelled) return;
          if (now - lastDetect >= 45 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            lastDetect = now;
            try {
              const result = adapter?.detect(video, now);
              const landmarks = result?.landmarks[0];
              if (!landmarks) {
                missingHandFrames += 1;
                stableOpenFrames = 0;
                stablePinchFrames = 0;
                if (missingHandFrames >= 3) {
                  smoothed = null;
                  setHandLandmarks(null);
                  onGestureChange(null);
                  updateStatus("no-hand");
                }
              } else {
                missingHandFrames = 0;
                setHandLandmarks(landmarks);
                const measured = readGesture(landmarks);
                stableOpenFrames = measured.openPalm ? stableOpenFrames + 1 : 0;
                stablePinchFrames = measured.pinch ? stablePinchFrames + 1 : 0;
                smoothed = smoothGesture(smoothed, {
                  ...measured,
                  openPalm: stableOpenFrames >= 3,
                  pinch: stablePinchFrames >= 2,
                });
                onGestureChange(smoothed);
                const activeStep = stepRef.current;
                const gestureReady =
                  (activeStep === 1 && smoothed.openPalm) ||
                  (activeStep === 2 && smoothed.pinch) ||
                  (activeStep === 4 && smoothed.indexFinger) ||
                  ((activeStep === 3 || activeStep === 5 || activeStep === 6) &&
                    smoothed.openPalm);
                updateStatus(gestureReady ? "tracking" : "hand-detected");
              }
            } catch (error) {
              const message = error instanceof Error ? error.message : "识别过程中发生未知错误。";
              updateStatus("error", message);
              onModeChange("mouse");
              return;
            }
          }
          animationFrame = requestAnimationFrame(detectFrame);
        };
        animationFrame = requestAnimationFrame(detectFrame);
      } catch (error) {
        if (cancelled) return;
        if (
          selectedDeviceId &&
          error instanceof DOMException &&
          error.name === "NotReadableError" &&
          !fallbackFromBusyDevice.current
        ) {
          const alternateDevice = availableDevices.find(
            (device) => device.deviceId !== selectedDeviceId,
          );
          if (alternateDevice) {
            fallbackFromBusyDevice.current = true;
            const selectedDevice = availableDevices.find(
              (device) => device.deviceId === selectedDeviceId,
            );
            fallbackNotice.current = `${selectedDevice?.label || "当前摄像头"}正在被其他程序使用，已自动切换`;
            setSelectedDeviceId(alternateDevice.deviceId);
            updateStatus("requesting", `${fallbackNotice.current}「${alternateDevice.label}」。`);
            return;
          }
        }
        const nextStatus = getCameraErrorStatus(error);
        const message =
          error instanceof DOMException && error.name === "NotReadableError"
            ? fallbackNotice.current
              ? `${fallbackNotice.current}，备用摄像头也无法读取。请关闭占用摄像头的应用或其他浏览器标签页后重试。`
              : "浏览器无法读取摄像头，设备可能正被会议软件、相机应用或其他浏览器标签页占用。请关闭占用程序后重试。"
            : error instanceof Error
              ? error.message
              : "请检查浏览器摄像头权限及设备连接。";
        updateStatus(nextStatus, message);
        setHandLandmarks(null);
        onGestureChange(null);
        onModeChange("mouse");
      }
    }

    void startCamera();
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      adapter?.close();
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setHandLandmarks(null);
      onGestureChange(null);
    };
  }, [cameraAttempt, cameraEnabled, onGestureChange, onModeChange, onStatusChange, selectedDeviceId]);

  return (
    <section className="gesture-controller" aria-label="摄像头手势控制">
      <div className="camera-preview">
        <video ref={videoRef} autoPlay muted playsInline aria-label="摄像头手部预览" />
        {handLandmarks && (
          <svg
            className="hand-skeleton"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
            role="img"
            aria-label="实时识别到的手部骨骼关键点"
          >
            {HAND_CONNECTIONS.map(({ start, end }) => {
              const from = handLandmarks[start];
              const to = handLandmarks[end];
              return (
                <line
                  key={`${start}-${end}`}
                  x1={1 - from.x}
                  y1={from.y}
                  x2={1 - to.x}
                  y2={to.y}
                />
              );
            })}
            {handLandmarks.map((landmark, index) => (
              <circle
                key={index}
                cx={1 - landmark.x}
                cy={landmark.y}
                r={index === 0 || [4, 8, 12, 16, 20].includes(index) ? 0.012 : 0.008}
                className={index === 0 || [4, 8, 12, 16, 20].includes(index) ? "is-joint-major" : ""}
              />
            ))}
          </svg>
        )}
        {step === 2 && (
          <div className="camera-target-guide" aria-hidden="true">
            {MOTIFS.flatMap((motif) =>
              motif.positions.map((position, index) => (
                <span
                  key={`${motif.id}-${index}`}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                >
                  {motif.label.slice(0, 1)}
                </span>
              )),
            )}
          </div>
        )}
        <span className={`camera-status camera-status--${status}`}>
          <i /> {STATUS_LABELS[status]}
        </span>
      </div>
      <div className="gesture-controller-footer">
        <span title={deviceName}>{deviceName ? `已连接：${deviceName}` : "MediaPipe 手势识别 · 本地运行"}</span>
        <button
          className="camera-action"
          type="button"
          onClick={() => {
            if (cameraEnabled) {
              if (status === "error" || status === "denied" || status === "unavailable") {
                fallbackFromBusyDevice.current = false;
                fallbackNotice.current = "";
                setDetail("");
                setStatus("requesting");
                setCameraAttempt((attempt) => attempt + 1);
              } else {
                setCameraEnabled(false);
                fallbackFromBusyDevice.current = false;
                fallbackNotice.current = "";
                setDeviceName("");
                onStatusChange("off");
                onGestureChange(null);
              }
            } else {
              setCameraEnabled(true);
              setStatus("requesting");
              setDetail("");
            }
          }}
        >
          {cameraEnabled
            ? status === "error" || status === "denied" || status === "unavailable"
              ? "重试连接"
              : "关闭摄像头"
            : "开启摄像头"}
        </button>
      </div>
      {cameraDevices.length > 1 && cameraEnabled && (
        <label className="camera-device-select">
          <span>摄像头设备</span>
          <select
            value={selectedDeviceId}
            onChange={(event) => {
              fallbackFromBusyDevice.current = false;
              fallbackNotice.current = "";
              setSelectedDeviceId(event.currentTarget.value);
            }}
          >
            <option value="">
              {deviceName ? `自动选择（当前：${deviceName}）` : "自动选择摄像头"}
            </option>
            {cameraDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="camera-help" aria-live="polite">
        {detail || (step === 2
          ? "捏合拾贝，移动至预览中的目标花位后松开。"
          : step === 4
            ? "用食指在镜头画面中绕圈，模拟拭漆。"
            : step === 6
              ? "张开手掌左右移动，或画圈打磨。"
              : "张开手掌左右移动推漆，画圈可推动显光与打磨。")}
      </p>
      <p className="camera-privacy">画面仅在本机识别，不录制、不上传。</p>
      <div className="input-mode-switch" role="group" aria-label="交互方式">
        <button
          type="button"
          className={inputMode === "camera" ? "is-active" : ""}
          onClick={() => onModeChange("camera")}
        >
          真实手势
        </button>
        <button
          type="button"
          className={inputMode === "mouse" ? "is-active" : ""}
          onClick={() => onModeChange("mouse")}
        >
          鼠标模拟
        </button>
      </div>
    </section>
  );
}
