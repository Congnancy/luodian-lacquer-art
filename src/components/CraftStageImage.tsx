import { useEffect, useState } from "react";
import { STEP_NAMES } from "../types";
import { publicAsset } from "../paths";

interface StageImageConfig {
  start: string;
  middle?: string;
  complete: string;
  completeAt?: number;
  states?: string[];
}

export const CRAFT_STAGE_IMAGES: StageImageConfig[] = [
  { start: "/craft-images/步骤1开始.png", complete: "/craft-images/步骤1完成.png" },
  {
    start: "/craft-images/步骤1完成.png",
    middle: "/craft-images/步骤2-50.png",
    complete: "/craft-images/步骤2.png",
  },
  {
    start: "/craft-images/步骤3状态0.png",
    complete: "/craft-images/步骤3状态4.png",
    states: [
      "/craft-images/步骤3状态0.png",
      "/craft-images/步骤3状态1.png",
      "/craft-images/步骤3状态2.png",
      "/craft-images/步骤3状态3.png",
      "/craft-images/步骤3状态4.png",
    ],
  },
  {
    start: "/craft-images/步骤3完成.png",
    middle: "/craft-images/步骤4开始.png",
    complete: "/craft-images/步骤4完成.png",
  },
  {
    start: "/craft-images/步骤4完成.png",
    middle: "/craft-images/步骤5开始.png",
    complete: "/craft-images/步骤5完成.png",
  },
  {
    start: "/craft-images/步骤6.png",
    middle: "/craft-images/步骤6-50.png",
    complete: "/craft-images/步骤6完成.png",
  },
  {
    start: "/craft-images/步骤7.png",
    complete: "/craft-images/步骤7完成.png",
    completeAt: 0.9,
  },
];

interface CraftStageImageProps {
  step: number;
  progress: number;
  stateIndex?: number;
}

interface TransitioningImageProps {
  initialSrc: string;
  targetSrc: string;
}

function TransitioningImage({ initialSrc, targetSrc }: TransitioningImageProps) {
  const [src, setSrc] = useState(initialSrc);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (targetSrc === src) return;
    setVisible(false);
    const timeout = window.setTimeout(() => {
      setSrc(targetSrc);
      requestAnimationFrame(() => setVisible(true));
    }, 420);
    return () => window.clearTimeout(timeout);
  }, [src, targetSrc]);

  return (
    <img
      className="craft-stage-image__layer craft-stage-image__transition"
      src={publicAsset(src)}
      alt=""
      style={{ opacity: visible ? 1 : 0 }}
    />
  );
}

export function CraftStageImage({ step, progress, stateIndex = 0 }: CraftStageImageProps) {
  const config = CRAFT_STAGE_IMAGES[step];
  const name = STEP_NAMES[step];
  if (step === 0) {
    return (
      <div
        className="craft-stage-image"
        role="img"
        aria-label={`${name}制作阶段原图，进度 ${Math.round(progress * 100)}%`}
      >
        <img className="craft-stage-image__layer" src={publicAsset(config.start)} alt="" />
        <img
          className="craft-stage-image__layer craft-stage-image__layer--complete"
          src={publicAsset(config.complete)}
          alt=""
          style={{ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }}
        />
      </div>
    );
  }

  if (config.states) {
    const targetSrc = config.states[Math.max(0, Math.min(config.states.length - 1, stateIndex))];
    return (
      <div
        className="craft-stage-image"
        role="img"
        aria-label={`${name}制作阶段原图，已镶嵌 ${stateIndex} 枚贝片`}
      >
        <TransitioningImage initialSrc={config.states[0]} targetSrc={targetSrc} />
      </div>
    );
  }

  if (config.middle) {
    const targetSrc =
      progress >= 1
        ? config.complete
        : progress >= 0.5
          ? config.middle
          : config.start;

    return (
      <div
        className="craft-stage-image"
        role="img"
        aria-label={`${name}制作阶段原图，进度 ${Math.round(progress * 100)}%`}
      >
        <TransitioningImage initialSrc={config.start} targetSrc={targetSrc} />
      </div>
    );
  }

  const targetSrc = progress >= (config.completeAt ?? (step === 0 ? 0.95 : 0.5))
    ? config.complete
    : config.start;

  return (
    <div
      className="craft-stage-image"
      role="img"
      aria-label={`${name}制作阶段原图，进度 ${Math.round(progress * 100)}%`}
    >
      <TransitioningImage initialSrc={config.start} targetSrc={targetSrc} />
    </div>
  );
}
