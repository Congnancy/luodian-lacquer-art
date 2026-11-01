import type { DragEvent } from "react";
import { MOTIFS } from "../types";

interface ShellInteractionProps {
  placed: string[];
  selectedId: string | null;
  message: string;
  onSelectFragment: (motifId: string) => void;
  onTryPlace: (targetId: string, fragmentId: string) => void;
  onMessage: (message: string) => void;
}

export function ShellInteraction({
  placed,
  selectedId,
  message,
  onSelectFragment,
  onTryPlace,
  onMessage,
}: ShellInteractionProps) {
  function handleDrop(event: DragEvent<HTMLButtonElement>, id: string) {
    event.preventDefault();
    const fragmentId = event.dataTransfer.getData("text/plain");
    if (fragmentId) onTryPlace(id, fragmentId);
  }

  return (
    <section className="shell-interaction" aria-labelledby="shell-title">
      <div className="shell-copy">
        <span className="eyebrow">一贝一色 · 逐纹镶嵌</span>
        <h3 id="shell-title">拣选螺片，安放花间</h3>
        <p aria-live="polite">{message}</p>
      </div>
      <div className="shell-targets" aria-label="选择要镶嵌的花纹">
        {MOTIFS.map((motif) => (
          <button
            className={`shell-target ${placed.includes(motif.id) ? "is-placed" : ""}`}
            key={motif.id}
            type="button"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, motif.id)}
            onClick={() => {
              if (selectedId) {
                onTryPlace(motif.id, selectedId);
              } else {
                onMessage(placed.includes(motif.id) ? "这枚贝片已经嵌好。" : `选中「${motif.label}」：请从贝片匣挑一片螺钿。`);
              }
            }}
            aria-label={`${motif.label}${placed.includes(motif.id) ? "，已镶嵌" : "，放置贝片"}`}
          >
            <span className="target-flower" aria-hidden="true">✿</span>
            <span>{motif.label}</span>
            {placed.includes(motif.id) && <span className="target-check">已入花心</span>}
          </button>
        ))}
      </div>
      <div className="shell-tray" aria-label="可用螺钿贝片真实素材">
        <span className="tray-label">螺钿贝片匣</span>
        {MOTIFS.map((motif, index) => (
          <button
            className={`shell-fragment shell-fragment--${index + 1} ${selectedId === motif.id ? "is-selected" : ""} ${placed.includes(motif.id) ? "is-used" : ""}`}
            key={motif.id}
            type="button"
            draggable={!placed.includes(motif.id)}
            disabled={placed.includes(motif.id)}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", motif.id);
              event.dataTransfer.effectAllowed = "move";
              onMessage(`已取出一片贝光，请拖到「${motif.label}」附近的花纹。`);
            }}
            onClick={() => {
              if (placed.includes(motif.id)) return;
              onSelectFragment(motif.id);
              onMessage(`已选中贝片。现在点击「${motif.label}」花纹完成镶嵌。`);
            }}
            aria-label={`拾取贝片${index + 1}，对应${motif.label}${placed.includes(motif.id) ? "，已使用" : ""}`}
          >
            <img
              className={`fragment-material fragment-material--${index + 1}`}
              src={motif.image}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          </button>
        ))}
        <span className="tray-count">{placed.length} / 4 枚</span>
      </div>
    </section>
  );
}
