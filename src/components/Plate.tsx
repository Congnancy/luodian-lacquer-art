import { MOTIFS, type StepName } from "../types";

interface PlateProps {
  stepName: StepName;
  progress: number;
  inlaidMotifs: string[];
  className?: string;
}

const flowerPetals = Array.from({ length: 8 }, (_, index) => index);

function Flower({ x, y, inlaid, reveal }: { x: number; y: number; inlaid: boolean; reveal: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {flowerPetals.map((petal) => (
        <ellipse
          key={petal}
          cx="0"
          cy="-18"
          rx="8.5"
          ry="19"
          transform={`rotate(${petal * 45})`}
          fill={inlaid ? "url(#shell)" : "none"}
          opacity={inlaid ? 0.92 : 0.34}
          stroke="url(#goldLine)"
          strokeWidth="1.2"
        />
      ))}
      <circle
        cx="0"
        cy="0"
        r="10"
        fill={inlaid || reveal > 0 ? "url(#shell)" : "url(#goldLine)"}
        opacity={inlaid ? 1 : Math.max(0.18, reveal)}
      />
      <circle cx="0" cy="0" r="32" fill="none" stroke="url(#goldLine)" strokeWidth="0.7" opacity="0.45" />
    </g>
  );
}

export function Plate({ stepName, progress, inlaidMotifs, className = "" }: PlateProps) {
  const isDrawing = stepName === "描纹定样";
  const lacquerProgress = stepName === "初髹黑漆" || stepName === "复髹罩漆" || stepName === "罩清提光" ? progress : 0;
  const revealProgress = stepName === "拭漆显贝" ? progress : stepName === "磨光成器" ? 1 : 0;
  const polished = stepName === "磨光成器" ? progress : 0;

  return (
    <div className={`plate-stage ${className}`}>
      <svg viewBox="0 0 460 460" className="plate-art" role="img" aria-label="黑漆螺钿花鸟纹圆盘">
        <defs>
          <radialGradient id="plateFace" cx="43%" cy="33%">
            <stop offset="0%" stopColor={lacquerProgress > 0.5 ? "#334c40" : "#15221c"} />
            <stop offset="72%" stopColor="#101a15" />
            <stop offset="100%" stopColor="#080e0b" />
          </radialGradient>
          <linearGradient id="plateRim" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#e2cc8e" />
            <stop offset=".34" stopColor="#7f6836" />
            <stop offset=".62" stopColor="#dbc78f" />
            <stop offset="1" stopColor="#654f29" />
          </linearGradient>
          <linearGradient id="goldLine">
            <stop stopColor="#e5d3a2" />
            <stop offset=".53" stopColor="#9f8143" />
            <stop offset="1" stopColor="#d4bf83" />
          </linearGradient>
          <linearGradient id="shell" x1="0" y1="0" x2=".95" y2=".65">
            <stop stopColor="#8edac2" />
            <stop offset=".26" stopColor="#edb9d1" />
            <stop offset=".54" stopColor="#ede19d" />
            <stop offset=".76" stopColor="#97c5e4" />
            <stop offset="1" stopColor="#dec7ef" />
          </linearGradient>
          <radialGradient id="sheen">
            <stop stopColor="#ffffdf" stopOpacity=".72" />
            <stop offset=".48" stopColor="#84d3be" stopOpacity=".2" />
            <stop offset="1" stopColor="#d2b4e4" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <ellipse cx="230" cy="236" rx="197" ry="193" fill="#030806" opacity=".78" />
        <circle cx="230" cy="222" r="190" fill="url(#plateRim)" />
        <circle cx="230" cy="222" r="183" fill="#111812" stroke="#d1ba7b" strokeWidth="1.2" />
        <circle cx="230" cy="222" r="175" fill="url(#plateFace)" />
        <circle cx="230" cy="222" r="169" fill="none" stroke="url(#goldLine)" strokeWidth="1" opacity=".7" />
        <circle cx="230" cy="222" r="162" fill="none" stroke="#d7c38e" strokeWidth=".6" strokeDasharray="1 4" opacity=".55" />

        <g fill="none" stroke="url(#goldLine)" strokeWidth="1" opacity=".55">
          <path d="M132 308 C115 275 152 260 176 280 C196 299 184 325 157 333 C139 337 122 327 122 315" />
          <path d="M328 308 C345 275 308 260 284 280 C264 299 276 325 303 333 C321 337 338 327 338 315" />
          <path d="M135 136 C163 115 189 132 179 154 C170 173 145 165 146 149 C147 140 157 137 163 143" />
          <path d="M325 136 C297 115 271 132 281 154 C290 173 315 165 314 149 C313 140 303 137 297 143" />
          <path d="M138 304 C128 290 136 277 151 275 M322 304 C332 290 324 277 309 275" />
          <path d="M150 139 C168 128 178 136 180 149 M310 139 C292 128 282 136 280 149" />
        </g>
        <g fill="url(#goldLine)" opacity=".75">
          <path d="M138 287 Q150 277 160 287 Q149 286 143 297Z" />
          <path d="M322 287 Q310 277 300 287 Q311 286 317 297Z" />
          <circle cx="143" cy="308" r="2" /><circle cx="317" cy="308" r="2" />
          <circle cx="173" cy="130" r="2" /><circle cx="287" cy="130" r="2" />
        </g>

        {MOTIFS.map((motif) => {
          const inlaid = inlaidMotifs.includes(motif.id);
          return (
            <g key={motif.id}>
              {motif.positions.map((position, index) => {
                const x = (position.x / 100) * 460;
                const y = (position.y / 100) * 460;
                return (
                  <g key={`${motif.id}-${index}`} className={isDrawing ? "flower-draw" : ""}>
                    <Flower x={x} y={y} inlaid={inlaid} reveal={revealProgress} />
                    {inlaid && (
                      <path
                        d={`M${x - 18} ${y + 12} Q${x} ${y + 44} ${x + 18} ${y + 12}`}
                        fill="none"
                        stroke="url(#shell)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity=".95"
                        filter="url(#softGlow)"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        <g fill="none" stroke="url(#goldLine)" strokeWidth=".9" opacity=".42">
          <path d="M147 228 Q181 193 205 215 Q219 229 204 241 Q193 249 185 238 Q181 230 191 226" />
          <path d="M313 228 Q279 193 255 215 Q241 229 256 241 Q267 249 275 238 Q279 230 269 226" />
          <path d="M230 101 Q204 125 220 141 Q231 151 241 141 Q250 132 240 126" />
          <path d="M230 343 Q204 319 220 303 Q231 293 241 303 Q250 312 240 318" />
        </g>
        {revealProgress > 0 && (
          <g opacity={revealProgress} filter="url(#softGlow)" fill="url(#shell)">
            <path d="M189 189 Q205 164 223 188 Q207 180 189 189Z" />
            <path d="M270 256 Q250 235 238 257 Q256 248 270 256Z" />
            <path d="M182 260 Q201 244 215 263 Q198 257 182 260Z" />
            <ellipse cx="265" cy="188" rx="8" ry="13" transform="rotate(-38 265 188)" />
            <ellipse cx="208" cy="278" rx="6" ry="11" transform="rotate(31 208 278)" />
          </g>
        )}
        {polished > 0 && (
          <ellipse
            cx={115 + polished * 260}
            cy={123 + polished * 176}
            rx="85"
            ry="68"
            fill="url(#sheen)"
            opacity={Math.min(.72, .16 + polished * .6)}
          />
        )}
        {lacquerProgress > 0 && (
          <ellipse
            cx={145 + lacquerProgress * 165}
            cy="190"
            rx="47"
            ry="130"
            fill="url(#sheen)"
            opacity={lacquerProgress * .32}
            transform={`rotate(-32 ${145 + lacquerProgress * 165} 190)`}
          />
        )}
        {Array.from({ length: 12 }, (_, index) => (
          <circle
            key={index}
            cx={230 + Math.cos((index * Math.PI) / 6) * 177}
            cy={222 + Math.sin((index * Math.PI) / 6) * 177}
            r="1.4"
            fill="#ead8a6"
            opacity=".84"
          />
        ))}
      </svg>
      <span className="plate-caption">黑漆描金 · 四时花卉</span>
    </div>
  );
}
