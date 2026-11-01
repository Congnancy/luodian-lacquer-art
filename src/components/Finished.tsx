import { STEP_NAMES } from "../types";
import { publicAsset } from "../paths";

interface FinishedProps {
  placed: string[];
  progress: number[];
  patternProgress: number;
  artifactName: string;
  lacquerName: string;
  onRestart: () => void;
  onHome: () => void;
  onReselect: () => void;
}

export function Finished({ placed, progress, patternProgress, artifactName, lacquerName, onRestart, onHome, onReselect }: FinishedProps) {
  const completedStages =
    Number(patternProgress >= 1) +
    progress.reduce(
      (completed, amount, index) =>
        completed + (index !== 0 && index !== 2 && amount >= 0.85 ? 1 : 0),
      0,
    ) +
    Number(placed.length === 4);

  return (
    <main className="finished-page">
      <header className="workshop-topbar">
        <button className="brand brand-button" type="button" onClick={onHome}>
          <span className="brand-seal">螺</span><span>一螺一世界 <i>·</i> 手作体验</span>
        </button>
        <span className="studio-note">作于云上漆作 · 匠心留念</span>
        <button className="exit-button" type="button" onClick={onHome}>返回首页 <span aria-hidden="true">↗</span></button>
      </header>
      <section className="finished-content">
        <div className="finished-copy">
          <span className="eyebrow"><span className="ornament-line" /> 七道既毕 · 一器初成</span>
          <h1>贝光入漆，<br /><span>时光成器。</span></h1>
          <p>从第一笔描纹，到最后一圈推光，你已走过七道工序。每一片微光，都是亲手留下的印记。</p>
          <div className="finished-stats">
            <div><strong>{placed.length}<i> / 4</i></strong><span>枚贝片入漆</span></div>
            <div><strong>七<span>道</span></strong><span>传统制作工序</span></div>
            <div><strong>{completedStages}<i> / 7</i></strong><span>已完成工序</span></div>
          </div>
          <div className="finished-actions">
            <button className="primary-button" type="button" onClick={onRestart}>重新挑战 <span aria-hidden="true">↻</span></button>
            <button className="secondary-button" type="button" onClick={onReselect}>重新选择器型</button>
            <button className="secondary-button" type="button" onClick={onHome}>返回首页</button>
          </div>
        </div>
        <div className="finished-art">
          <span className="finished-art-label">你的作品 <i>·</i> 001</span>
          <video
            className="finished-art-video"
            src={publicAsset("/craft-images/成品展示.mp4")}
            autoPlay
            muted
            loop
            playsInline
            controls
            aria-label="螺钿漆器成品循环展示视频"
          />
          <span className="finished-art-caption">{lacquerName} · {artifactName}</span>
        </div>
      </section>
      <footer className="finished-footer">
        <span>{STEP_NAMES.join("　·　")}</span>
        <span>螺钿漆器 · 数字手作体验</span>
      </footer>
    </main>
  );
}
