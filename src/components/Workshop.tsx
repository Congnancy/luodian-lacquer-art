import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GestureInputAdapter } from "./GestureInputAdapter";
import { CraftStageImage } from "./CraftStageImage";
import { GestureController, type CameraStatus, type HandGestureState } from "./GestureController";
import { Progress } from "./Progress";
import { ShellInteraction } from "./ShellInteraction";
import { MOTIFS, STEP_NAMES } from "../types";

interface WorkshopProps {
  step: number;
  progress: number[];
  patternProgress: number;
  placed: string[];
  artifactName: string;
  lacquerName: string;
  onSelectStep: (step: number) => void;
  onProgress: (step: number, value: number) => void;
  onPatternProgress: (progress: number) => void;
  onResetPatternProgress: () => void;
  onRestartStep: (step: number) => void;
  onPlaceShell: (motifId: string) => void;
  onFinish: () => void;
  onHome: () => void;
  onBackToSelection: () => void;
}

const descriptions = [
  "纹样落于盘面，螺钿之美由此开始。",
  "漆色渐深，为螺钿纹样铺就沉静的底色。",
  "拾取贝光，将细碎的虹彩嵌入预定纹样。",
  "再次髹漆，使螺钿与漆面融为一体。",
  "循着纹样轻轻拭漆，让贝壳虹彩再次显现。",
  "覆以清漆，封存螺钿流转的光彩。",
  "细磨慢抛，让漆器呈现温润而深邃的光泽。",
];

const instructions = [
  "纹样随工序原图逐渐显现；可暂停或重新播放自动描样。",
  "张开手掌在镜头前左右移动，推髹黑漆；也可切换鼠标模拟。",
  "捏合食指与拇指拾取螺钿，移至镜头预览中对应花位后松开。",
  "张开手掌左右移动，再次推髹；也可切换鼠标模拟。",
  "伸出食指在镜头前绕圈，逐步拭漆显贝；也可切换鼠标模拟。",
  "张开手掌左右移动，推抹透明清漆；也可切换鼠标模拟。",
  "张开手掌在镜头前画圈打磨抛光；也可切换鼠标模拟。",
];

export function Workshop({
  step,
  progress,
  patternProgress,
  placed,
  artifactName,
  lacquerName,
  onSelectStep,
  onProgress,
  onPatternProgress,
  onResetPatternProgress,
  onRestartStep,
  onPlaceShell,
  onFinish,
  onHome,
  onBackToSelection,
}: WorkshopProps) {
  const currentProgress = progress[step] ?? 0;
  const [selectedShell, setSelectedShell] = useState<string | null>(null);
  const [shellMessage, setShellMessage] = useState("捏合拾取真实贝片，移动至摄像头预览中的对应花位后松开。");
  const [patternPaused, setPatternPaused] = useState(false);
  const [patternRun, setPatternRun] = useState(0);
  const [interactionRun, setInteractionRun] = useState(0);
  const [inputMode, setInputMode] = useState<"camera" | "mouse">("camera");
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("requesting");
  const [handGesture, setHandGesture] = useState<HandGestureState | null>(null);
  const previousPinch = useRef(false);
  const updateCameraStatus = useCallback((status: CameraStatus) => setCameraStatus(status), []);
  const updateHandGesture = useCallback((gesture: HandGestureState | null) => setHandGesture(gesture), []);
  const updateInputMode = useCallback((mode: "camera" | "mouse") => setInputMode(mode), []);
  const completedSteps = useMemo(
    () => STEP_NAMES.map((_, index) => index === 0 ? patternProgress >= 1 : index === 2 ? placed.length >= MOTIFS.length : progress[index] >= 0.85),
    [patternProgress, placed.length, progress],
  );

  useEffect(() => {
    if (step !== 0 || patternProgress >= 1 || patternPaused) return;
    const startedAt = performance.now() - patternProgress * 2200;
    let frame = 0;
    const animate = (now: number) => {
      const amount = Math.min(1, (now - startedAt) / 2200);
      onPatternProgress(amount);
      if (amount < 1) frame = requestAnimationFrame(animate);
    };
    const delay = window.setTimeout(() => {
      frame = requestAnimationFrame(animate);
    }, 100);
    return () => {
      window.clearTimeout(delay);
      cancelAnimationFrame(frame);
    };
  }, [step, patternPaused, patternRun]);

  useEffect(() => {
    if (step === 0) setPatternPaused(false);
  }, [step]);

  useEffect(() => {
    if (cameraStatus === "denied" || cameraStatus === "unavailable" || cameraStatus === "error") {
      setInputMode("mouse");
    }
  }, [cameraStatus]);

  useEffect(() => {
    const pinching = inputMode === "camera" && step === 2 && Boolean(handGesture?.pinch);
    if (pinching && !previousPinch.current) {
      const nextShell = MOTIFS.find((motif) => !placed.includes(motif.id));
      if (nextShell) {
        setSelectedShell(nextShell.id);
        setShellMessage(`已捏取「${nextShell.label}」。对准摄像头预览中的对应花位，松开手指完成镶嵌。`);
      } else {
        setShellMessage("四枚螺钿均已完成镶嵌。");
      }
    } else if (!pinching && previousPinch.current && selectedShell && handGesture) {
      const distanceToMotif = (motif: (typeof MOTIFS)[number]) =>
        Math.min(...motif.positions.map((position) =>
          Math.hypot(position.x / 100 - handGesture.indexX, position.y / 100 - handGesture.indexY),
        ));
      const target = [...MOTIFS].sort((a, b) => {
        const distanceA = distanceToMotif(a);
        const distanceB = distanceToMotif(b);
        return distanceA - distanceB;
      })[0];
      const targetDistance = target ? distanceToMotif(target) : 1;
      if (target && targetDistance < 0.24) {
        tryPlaceShell(target.id, selectedShell);
      } else {
        setShellMessage("请将手指移至摄像头预览中对应花位的圆点附近再松开。");
      }
      setSelectedShell(null);
    }
    previousPinch.current = pinching;
  }, [handGesture, inputMode, placed, selectedShell, step]);

  const name = STEP_NAMES[step];
  const activeProgress = step === 0 ? patternProgress : step === 2 ? placed.length / MOTIFS.length : currentProgress;
  const gestureKind = step === 4 ? "reveal" : step === 6 ? "polish" : "horizontal";

  return (
    <main className="workshop-page">
      <header className="workshop-topbar">
        <button className="brand brand-button" type="button" onClick={onHome}>
          <span className="brand-seal">螺</span><span>一螺一世界 <i>·</i> 手作体验</span>
        </button>
        <span className="studio-note"><span className="live-dot" /> 云上漆作 · 数字工坊</span>
        <button className="exit-button" type="button" onClick={onBackToSelection}>返回器型选择 <span aria-hidden="true">↗</span></button>
      </header>

      <Progress currentStep={step} completedSteps={completedSteps} onSelectStep={onSelectStep} />

      <section className="workshop-main">
        <div className="stage-heading">
          <div>
            <span className="eyebrow">古法七道 · 第 {String(step + 1).padStart(2, "0")} 道</span>
            <h1>{name}</h1>
            <p>{descriptions[step]}</p>
          </div>
          <div className="step-counter"><strong>{String(step + 1).padStart(2, "0")}</strong><span> / 07</span></div>
        </div>

        <div className={`workbench ${step === 2 ? "workbench--inlay" : ""}`}>
          <div className="workbench-art">
            <p className="workbench-kicker"><span className="ornament-line" /> 漆器 · {artifactName} · {lacquerName}</p>
            {step === 2 ? (
              <div className="stage-image-wrap">
                <CraftStageImage step={step} progress={placed.length / MOTIFS.length} stateIndex={placed.length} />
                {inputMode === "camera" && selectedShell && handGesture?.pinch && (
                  <div
                    className="pinched-shell"
                    style={{
                      left: `${handGesture.indexX * 100}%`,
                      top: `${handGesture.indexY * 100}%`,
                    }}
                    aria-hidden="true"
                  >
                    <img
                      className={`fragment-material fragment-material--${MOTIFS.findIndex((motif) => motif.id === selectedShell) + 1}`}
                      src={MOTIFS.find((motif) => motif.id === selectedShell)?.image}
                      alt=""
                      draggable={false}
                    />
                    <span>捏合中</span>
                  </div>
                )}
              </div>
            ) : step >= 1 && step <= 6 ? (
              <GestureInputAdapter
                key={`${step}-${interactionRun}`}
                kind={gestureKind}
                progress={currentProgress}
                inputMode={inputMode}
                handGesture={handGesture}
                onProgress={(value) => onProgress(step, value)}
              >
                <CraftStageImage step={step} progress={currentProgress} />
              </GestureInputAdapter>
            ) : (
              <div className="stage-image-wrap">
                <CraftStageImage step={step} progress={activeProgress} />
                <div className="drawing-progress"><span style={{ width: `${activeProgress * 100}%` }} /></div>
              </div>
            )}
            {step === 0 && (
              <div className="pattern-controls" aria-label="纹样动画控制">
                <button className="text-button" type="button" onClick={() => setPatternPaused((paused) => !paused)}>
                  {patternPaused ? "继续描样" : "暂停描样"}
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    onResetPatternProgress();
                    setPatternPaused(false);
                    setPatternRun((run) => run + 1);
                  }}
                >
                  重新播放 ↻
                </button>
              </div>
            )}
            {step === 2 && (
              <ShellInteraction
                placed={placed}
                selectedId={selectedShell}
                message={shellMessage}
                onSelectFragment={setSelectedShell}
                onTryPlace={tryPlaceShell}
                onMessage={setShellMessage}
              />
            )}
          </div>
          <aside className="craft-notes">
            <div className="note-index">{String(step + 1).padStart(2, "0")} <span>—</span> 07</div>
            <div className="note-divider" />
            <h2>{step === 2 ? "贝有天然之色" : step === 4 ? "光从漆下生" : step === 6 ? "器成，光自来" : "一道一层，慢而有度"}</h2>
            <p className="instruction">{instructions[step]}</p>
            <div className="craft-meter">
              <div className="meter-header"><span>此道工序</span><span>{Math.round(activeProgress * 100)}%</span></div>
              <div className="meter-track"><span style={{ width: `${activeProgress * 100}%` }} /></div>
            </div>
            <div className="craft-seal">
              <span>螺</span>
              <p>匠作无声<br /><i>光华有时</i></p>
            </div>
            <GestureController
              step={step}
              inputMode={inputMode}
              onModeChange={updateInputMode}
              onStatusChange={updateCameraStatus}
              onGestureChange={updateHandGesture}
            />
            <div className="input-note">
              <span className="input-note-dot" />
              {inputMode === "camera" && cameraStatus === "tracking"
                ? "真实手势已连接"
                : inputMode === "camera" && cameraStatus === "hand-detected"
                  ? "检测到手，请按本步提示做动作"
                : inputMode === "camera" && cameraStatus === "no-hand"
                  ? "摄像头已连接，等待手部动作"
                : inputMode === "camera"
                  ? "正在连接摄像头"
                  : "鼠标模拟模式"}
            </div>
          </aside>
        </div>

        <footer className="workshop-navigation">
          <button className="previous-button" type="button" onClick={() => onSelectStep(Math.max(0, step - 1))} disabled={step === 0}>
            <span aria-hidden="true">←</span> 上一步
          </button>
          <button
            className="restart-step-button"
            type="button"
            onClick={() => {
              onRestartStep(step);
              setSelectedShell(null);
              previousPinch.current = false;
              setInteractionRun((run) => run + 1);
              if (step === 0) {
                setPatternPaused(false);
                setPatternRun((run) => run + 1);
              } else if (step === 2) {
                setShellMessage("已重新开始本步，请按顺序拾取并镶嵌四枚螺钿。");
              }
            }}
            aria-label={`重新挑战：${name}`}
          >
            ↻ 重新挑战
          </button>
          <span className="navigation-hint">{step === 6 ? activeProgress >= 0.85 ? "七道工序已毕，作品即将呈现" : "再完成几段推光打磨，即可欣赏作品" : step === 2 ? `${placed.length} 枚贝片已入漆` : activeProgress >= 1 ? "此道工序已完成" : "你可以随时切换工序，回来继续制作"}</span>
          {step < STEP_NAMES.length - 1 ? (
            <button className="next-button" type="button" onClick={() => onSelectStep(step + 1)}>
              下一步 <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button className="next-button" type="button" onClick={onFinish} disabled={activeProgress < 0.85}>
              欣赏成器 <span aria-hidden="true">✧</span>
            </button>
          )}
        </footer>
      </section>
    </main>
  );

  function tryPlaceShell(targetId: string, fragmentId: string) {
    const target = MOTIFS.find((motif) => motif.id === targetId);
    const fragment = MOTIFS.find((motif) => motif.id === fragmentId);
    const expectedFragment = MOTIFS[placed.length];
    if (!target || !fragment) {
      setShellMessage("这枚贝片无法识别，请重新挑选贝片匣中的螺钿。");
    } else if (expectedFragment && fragmentId !== expectedFragment.id) {
      setShellMessage(`请按顺序先镶嵌「${expectedFragment.label}」对应的素材${placed.length + 1}。`);
    } else if (targetId !== fragmentId) {
      setShellMessage(
        inputMode === "camera"
          ? `这片贝光应嵌在「${fragment.label}」，请移动至对应花位后松开。`
          : `这片贝光应嵌在「${fragment.label}」，请拖到对应花纹再轻轻放下。`,
      );
    } else if (placed.includes(targetId)) {
      setShellMessage("这枚贝片已经嵌好，换一朵还未镶嵌的花纹吧。");
    } else {
      onPlaceShell(targetId);
      setSelectedShell(null);
      setShellMessage(`${target.label}：贝片已稳稳嵌入。`);
    }
  }
}
