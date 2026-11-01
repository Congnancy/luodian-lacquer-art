import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import type { HandGestureState } from "./GestureController";

type GestureKind = "horizontal" | "reveal" | "polish";

interface GestureInputAdapterProps {
  kind: GestureKind;
  progress: number;
  onProgress: (progress: number) => void;
  inputMode: "camera" | "mouse";
  handGesture: HandGestureState | null;
  children: ReactNode;
}

export function GestureInputAdapter({
  kind,
  progress,
  onProgress,
  inputMode,
  handGesture,
  children,
}: GestureInputAdapterProps) {
  const previous = useRef<{ x: number; y: number; angle: number } | null>(null);
  const travelled = useRef(0);
  const cameraPrevious = useRef<{ x: number; y: number; angle: number } | null>(null);
  const cameraTravelled = useRef(0);
  const cameraStartProgress = useRef(progress);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    if (inputMode !== "camera" || !handGesture) {
      cameraPrevious.current = null;
      cameraTravelled.current = 0;
      return;
    }

    const needsOpenPalm = kind === "horizontal" || kind === "polish";
    const hasRequiredGesture =
      needsOpenPalm ? handGesture.openPalm : handGesture.indexFinger;
    if (!hasRequiredGesture) {
      cameraPrevious.current = null;
      cameraTravelled.current = 0;
      return;
    }

    const x = kind === "reveal" ? handGesture.indexX : handGesture.x;
    const y = kind === "reveal" ? handGesture.indexY : handGesture.y;
    const angle = Math.atan2(y - 0.52, x - 0.5);
    const last = cameraPrevious.current;
    if (!last) {
      cameraStartProgress.current = progressRef.current;
      cameraPrevious.current = { x, y, angle };
      cameraTravelled.current = 0;
      return;
    }

    if (kind === "horizontal") {
      const deltaX = x - last.x;
      const deltaY = y - last.y;
      const horizontalMovement = Math.abs(deltaX);
      // Count both left and right motion so a natural sway advances the coating.
      if (horizontalMovement >= 0.002 && horizontalMovement >= Math.abs(deltaY) * 0.55) {
        cameraTravelled.current += horizontalMovement;
        if (cameraTravelled.current >= 0.2) {
          cameraStartProgress.current = Math.min(1, cameraStartProgress.current + 0.2);
          cameraTravelled.current -= 0.2;
          onProgress(cameraStartProgress.current);
        }
      }
    } else {
      const radius = Math.hypot(x - 0.5, y - 0.52);
      const previousRadius = Math.hypot(last.x - 0.5, last.y - 0.52);
      let delta = angle - last.angle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      if (radius > 0.13 && radius < 0.48 && Math.abs(radius - previousRadius) < 0.2) {
        cameraTravelled.current += Math.abs(delta);
        const turnsNeeded = kind === "reveal" ? Math.PI * 2 : Math.PI * 2.4;
        onProgress(Math.min(1, cameraStartProgress.current + cameraTravelled.current / turnsNeeded));
      }
    }
    cameraPrevious.current = { x, y, angle };
  }, [handGesture, inputMode, kind, onProgress]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (inputMode !== "mouse" || event.button !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;
    previous.current = {
      x,
      y,
      angle: Math.atan2(y - centerY, x - centerX),
    };
    travelled.current = 0;
    startProgress.current = progress;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  const startProgress = useRef(progress);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (inputMode !== "mouse") return;
    const from = previous.current;
    if (!from || (event.buttons & 1) === 0) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    if (kind === "horizontal") {
      travelled.current += Math.abs(x - from.x);
      onProgress(Math.min(1, startProgress.current + travelled.current / bounds.width));
    } else {
      const angle = Math.atan2(y - bounds.height / 2, x - bounds.width / 2);
      let delta = angle - from.angle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      if (Math.hypot(x - from.x, y - from.y) > 3) {
        travelled.current += Math.abs(delta);
        const turnsNeeded = kind === "reveal" ? Math.PI * 2 : Math.PI * 2.4;
        onProgress(Math.min(1, startProgress.current + travelled.current / turnsNeeded));
      }
      from.angle = angle;
    }
    from.x = x;
    from.y = y;
  }

  function completeSegment() {
    onProgress(Math.min(1, progress + 0.24));
  }

  const actionLabel =
    inputMode === "camera"
      ? kind === "horizontal"
        ? "张开手掌左右移动"
        : kind === "reveal"
          ? "伸出食指画圈"
          : "张开手掌画圈"
      : kind === "horizontal"
        ? "补做一段推髹动作"
        : kind === "reveal"
          ? "补做一段拭漆动作"
          : "补做一段打磨动作";

  return (
    <div
      className={`gesture-surface gesture-surface--${kind}`}
      data-input-mode={inputMode}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => {
        previous.current = null;
      }}
      onPointerCancel={() => {
        previous.current = null;
      }}
      aria-label={inputMode === "camera" ? "摄像头手势操作区域" : "手工动作模拟区：按住鼠标左键并按照提示移动"}
    >
      {children}
      <div className="gesture-assist">
        <button
          className="text-button"
          type="button"
          onClick={completeSegment}
          disabled={inputMode === "camera"}
        >
          {actionLabel} <span aria-hidden="true">↗</span>
        </button>
        <span>{Math.round(progress * 100)}% 已完成</span>
      </div>
    </div>
  );
}
