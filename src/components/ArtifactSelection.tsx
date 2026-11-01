import { useState, type CSSProperties } from "react";
import {
  getArtifact,
  getCategoryArtifacts,
  getLacquer,
  LACQUER_COLORS,
  RELIC_ALLOWED_COLORS,
  VESSEL_CATEGORIES,
  type LacquerColor,
  type VesselCategoryId,
} from "../artifacts";
import { VesselPreview } from "./VesselPreview";

interface ArtifactSelectionProps {
  artifactId: string | null;
  lacquer: LacquerColor | null;
  message?: string;
  onSelectArtifact: (artifactId: string) => void;
  onSelectLacquer: (lacquer: LacquerColor) => void;
  onConfirm: () => void;
  onHome: () => void;
}

export function ArtifactSelection({
  artifactId,
  lacquer,
  message,
  onSelectArtifact,
  onSelectLacquer,
  onConfirm,
  onHome,
}: ArtifactSelectionProps) {
  const selectedArtifact = getArtifact(artifactId);
  const [category, setCategory] = useState<VesselCategoryId>(selectedArtifact?.category ?? "geometric");
  const categoryArtifacts = getCategoryArtifacts(category);
  const availableColors = category === "relic"
    ? LACQUER_COLORS.filter((color) => RELIC_ALLOWED_COLORS.includes(color.id))
    : LACQUER_COLORS;
  const selectedLacquer = getLacquer(lacquer);
  const canBegin = selectedArtifact?.available && lacquer === "black";
  const selectionMessage = message ?? (
    !selectedArtifact
      ? "请先选择器型与漆色。"
      : selectedArtifact.available && lacquer === "black"
        ? "已接入八方盘漆黑版本的七步真实制作素材，可以开始体验。"
        : selectedArtifact.available
          ? "当前八方盘仅接入漆黑工艺素材，请选择漆黑后继续。"
          : "此器型的制作素材尚未接入；可预览选择，但目前只有黑漆嵌螺钿花鸟纹八方盘可进入七步体验。"
  );

  return (
    <main className="selection-page">
      <header className="selection-topbar">
        <button className="selection-brand" type="button" onClick={onHome} aria-label="返回漆艺造物首页">
          <span className="research-seal">漆</span>
          <span><strong>漆艺造物</strong><small>器型选择 · 01</small></span>
        </button>
        <div className="selection-progress" aria-label="创作流程：第一步，择器">
          <span className="selection-progress-active">01</span><i /><span>02 制作</span><i /><span>03 成器</span>
        </div>
        <button className="selection-home-link" type="button" onClick={onHome}>返回首页 <span aria-hidden="true">↗</span></button>
      </header>

      <section className="selection-workspace" aria-labelledby="selection-title">
        <div className="selection-heading">
          <p className="selection-eyebrow"><span /> SELECT YOUR VESSEL <span /></p>
          <h1 id="selection-title">择器</h1>
          <p>从器型与漆色开始，开启一段传统漆艺体验。</p>
        </div>

        <div className="selection-layout">
          <section className="selection-catalog" aria-label="选择器型">
            <div className="selection-category-tabs" role="tablist" aria-label="器型分类">
              {VESSEL_CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  id={`category-tab-${item.id}`}
                  className={`selection-category-tab${category === item.id ? " is-active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={category === item.id}
                  aria-controls="vessel-options"
                  onClick={() => setCategory(item.id)}
                >
                  <span>{item.label}</span><small>{item.en}</small>
                </button>
              ))}
            </div>
            <div className="selection-list-heading">
              <span>{VESSEL_CATEGORIES.find((item) => item.id === category)?.label}</span>
              <span>{String(categoryArtifacts.length).padStart(2, "0")} 件器型</span>
            </div>
            <div
              id="vessel-options"
              className="selection-vessel-grid"
              role="tabpanel"
              aria-labelledby={`category-tab-${category}`}
            >
              {categoryArtifacts.map((artifact, index) => (
                <button
                  className={`selection-vessel${artifact.id === artifactId ? " is-selected" : ""}`}
                  type="button"
                  key={artifact.id}
                  onClick={() => {
                    onSelectArtifact(artifact.id);
                    setCategory(artifact.category);
                  }}
                  aria-pressed={artifact.id === artifactId}
                  aria-label={`${artifact.name}${artifact.era ? `，${artifact.era}` : ""}${artifact.available ? "，已接入七步体验" : "，制作素材尚未接入"}`}
                >
                  <span className="selection-vessel-art">
                    {artifact.image
                      ? <img src={artifact.image} alt="" loading="eager" />
                      : <VesselPreview shape={artifact.shape} lacquer="black" />}
                    <span className="selection-vessel-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="selection-vessel-check" aria-hidden="true">{artifact.id === artifactId ? "✓" : ""}</span>
                  </span>
                  <span className="selection-vessel-copy">
                    <strong>{artifact.name}</strong>
                    <small>{artifact.era ?? VESSEL_CATEGORIES.find((item) => item.id === artifact.category)?.label}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <aside className="selection-detail" aria-label="器型详情与漆色选择">
            <div className="selection-detail-heading">
              <span>器物预览 <i>VESSEL PREVIEW</i></span>
              <span className={`selection-status${selectedArtifact?.available ? " is-ready" : ""}`}>
                <i />{selectedArtifact?.available ? "素材已接入" : "器型示意"}
              </span>
            </div>
            <div className="selection-vessel-stage">
              {selectedArtifact ? (
                selectedArtifact.image
                  ? <img className="selection-real-artifact" src={selectedArtifact.image} alt={`${selectedArtifact.name}真实制作素材`} />
                  : <VesselPreview shape={selectedArtifact.shape} lacquer={lacquer ?? "black"} />
              ) : <VesselPreview shape="round" lacquer={lacquer ?? "black"} />}
              <span className="selection-stage-caption">{selectedArtifact?.era ? `馆藏器型 · ${selectedArtifact.era}` : "器型预览 · 漆面示意"}</span>
            </div>
            <div className="selection-artifact-meta">
              <div>
                <span className="selection-detail-label">当前器型</span>
                <h2>{selectedArtifact?.name ?? "请选择一件器物"}</h2>
              </div>
              <p>{selectedArtifact?.description ?? "选择器型后，可在此查看器物形制与工艺信息。"}</p>
            </div>
            <div className="selection-color-block">
              <div className="selection-color-heading"><span>选择漆色</span><small>SELECT LACQUER</small></div>
              <div className="selection-color-options" role="group" aria-label="漆色">
                {availableColors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={`selection-color-option${lacquer === color.id ? " is-selected" : ""}`}
                    onClick={() => onSelectLacquer(color.id)}
                    aria-pressed={lacquer === color.id}
                  >
                    <span className="selection-color-chip" style={{ "--swatch": color.hex } as CSSProperties & { "--swatch": string }} />
                    <span>{color.label}</span>
                  </button>
                ))}
              </div>
              {category === "relic" && <p className="selection-color-note">历史文物保留原有漆色选项：朱红、漆黑。</p>}
            </div>
            <div className="selection-confirm">
              <p className={`selection-feedback${canBegin ? " is-ready" : ""}`} role="status" aria-live="polite">
                <span aria-hidden="true">{canBegin ? "✦" : "◇"}</span>
                {selectionMessage}
              </p>
              <button className="selection-confirm-button" type="button" onClick={onConfirm}>
                确认器型 <span aria-hidden="true">→</span>
              </button>
              <p className="selection-color-summary">
                已选：{selectedArtifact?.name ?? "未选择器型"} · {selectedLacquer?.label ?? "未选择漆色"}
              </p>
            </div>
          </aside>
        </div>
        <div className="selection-footnote"><span>漆艺造物 · 传统工艺数字体验</span><span>器型资料与工艺素材持续整理中</span></div>
      </section>
    </main>
  );
}
