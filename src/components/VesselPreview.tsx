import { useId } from "react";
import { getLacquer } from "../artifacts";

interface VesselPreviewProps {
  shape: string;
  lacquer: string;
  className?: string;
}

function polygon(sides: number, radius = 78, rotation = -Math.PI / 2) {
  const points = Array.from({ length: sides }, (_, index) => {
    const angle = rotation + index * Math.PI * 2 / sides;
    return `${(100 + radius * Math.cos(angle)).toFixed(1)},${(100 + radius * Math.sin(angle)).toFixed(1)}`;
  });
  return `M${points.join(" L")} Z`;
}

function flowerPath(petals: number, outer = 80, inner = 61) {
  const points = Array.from({ length: petals * 24 }, (_, index) => {
    const angle = index / (petals * 24) * Math.PI * 2;
    const wave = Math.pow((1 + Math.cos(petals * angle)) / 2, 1.6);
    const radius = inner + (outer - inner) * wave;
    return `${(100 + radius * Math.cos(angle)).toFixed(1)},${(100 + radius * Math.sin(angle)).toFixed(1)}`;
  });
  return `M${points.join(" L")} Z`;
}

function paths(shape: string) {
  switch (shape) {
    case "square":
    case "relic-1":
      return {
        outer: "M48 31 H152 Q169 31 169 48 V152 Q169 169 152 169 H48 Q31 169 31 152 V48 Q31 31 48 31Z",
        inner: "M56 47 H144 Q153 47 153 56 V144 Q153 153 144 153 H56 Q47 153 47 144 V56 Q47 47 56 47Z",
      };
    case "hexagon": return { outer: polygon(6, 79, -Math.PI / 2), inner: polygon(6, 59, -Math.PI / 2) };
    case "octagon":
    case "relic-4": return { outer: polygon(8, 79, -Math.PI / 2 + Math.PI / 8), inner: polygon(8, 59, -Math.PI / 2 + Math.PI / 8) };
    case "oval": return { ellipse: true, outer: "", inner: "" };
    case "cat":
      return {
        outer: "M36 59 L43 25 L72 44 Q100 29 128 44 L157 25 L164 59 Q179 83 167 126 Q153 169 100 172 Q47 169 33 126 Q21 83 36 59Z",
        inner: "M46 79 Q62 56 82 68 Q100 78 118 68 Q138 56 154 79 Q167 102 149 132 Q132 153 100 154 Q68 153 51 132 Q33 102 46 79Z",
      };
    case "rabbit":
      return {
        outer: "M47 75 Q34 36 48 19 Q63 4 75 52 Q100 40 125 52 Q137 4 152 19 Q166 36 153 75 Q174 96 164 128 Q151 169 100 172 Q49 169 36 128 Q26 96 47 75Z",
        inner: "M53 91 Q72 62 100 70 Q128 62 147 91 Q158 121 139 141 Q123 156 100 156 Q77 156 61 141 Q42 121 53 91Z",
      };
    case "butterfly":
      return {
        outer: "M100 91 Q66 32 35 45 Q7 61 29 91 Q43 111 86 106 Q47 119 50 146 Q57 171 100 128 Q143 171 150 146 Q153 119 114 106 Q157 111 171 91 Q193 61 165 45 Q134 32 100 91Z",
        inner: "M100 97 Q73 56 47 59 Q30 66 47 88 Q62 102 91 103 Q65 117 70 136 Q79 144 100 119 Q121 144 130 136 Q135 117 109 103 Q138 102 153 88 Q170 66 153 59 Q127 56 100 97Z",
      };
    case "fish":
      return {
        outer: "M22 100 Q47 47 106 60 L157 34 L153 81 Q183 100 153 119 L157 166 L106 140 Q47 153 22 100Z",
        inner: "M39 100 Q59 66 108 74 L143 57 L141 88 Q160 100 141 112 L143 143 L108 126 Q59 134 39 100Z",
      };
    case "bird":
      return {
        outer: "M39 118 Q33 81 74 67 Q83 39 116 47 Q137 51 140 72 Q171 75 166 101 Q181 118 151 127 Q125 157 86 146 Q51 140 39 118Z",
        inner: "M55 114 Q52 88 83 80 Q98 60 122 71 Q143 78 145 96 Q159 111 138 120 Q115 139 88 132 Q65 130 55 114Z",
      };
    case "relic-2": return { outer: flowerPath(5, 82, 60), inner: flowerPath(5, 62, 45) };
    case "relic-3": return { outer: flowerPath(8, 82, 66), inner: flowerPath(8, 62, 49) };
    case "round":
    case "relic-5":
    default: return { circle: true, outer: "", inner: "" };
  }
}

function shade(hex: string, amount: number) {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgb(${[16, 8, 0].map((shift) => Math.min(255, Math.round(((value >> shift) & 255) * amount))).join(",")})`;
}

export function VesselPreview({ shape, lacquer, className = "" }: VesselPreviewProps) {
  const uniqueId = useId().replace(/:/g, "");
  const color = getLacquer(lacquer)?.hex ?? "#20211E";
  const geometry = paths(shape);
  const gradientId = `lacquer-${uniqueId}`;
  const renderShape = (path: string, isInner = false) => {
    if (isInner && geometry.circle) return <circle cx="100" cy="100" r="60" fill={`url(#${gradientId})`} stroke="rgba(0,0,0,.48)" strokeWidth="1.4" />;
    if (isInner && geometry.ellipse) return <ellipse cx="100" cy="100" rx="62" ry="46" fill={`url(#${gradientId})`} stroke="rgba(0,0,0,.48)" strokeWidth="1.4" />;
    return <path d={path} fill={`url(#${gradientId})`} stroke="rgba(0,0,0,.48)" strokeWidth="1.4" strokeLinejoin="round" />;
  };

  return (
    <svg className={`vessel-preview ${className}`} viewBox="0 0 200 200" role="img" aria-label="漆器器型预览">
      <defs>
        <radialGradient id={gradientId} cx="38%" cy="30%" r="78%">
          <stop offset="0" stopColor={shade(color, 1.65)} />
          <stop offset=".38" stopColor={shade(color, 1.24)} />
          <stop offset=".78" stopColor={color} />
          <stop offset="1" stopColor={shade(color, .46)} />
        </radialGradient>
        <radialGradient id={`${gradientId}-shine`} cx="34%" cy="28%" r="50%">
          <stop offset="0" stopColor="#fff" stopOpacity=".4" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="174" rx="66" ry="8" fill="#000" opacity=".28" />
      {geometry.circle
        ? <circle cx="100" cy="100" r="78" fill={`url(#${gradientId})`} stroke="rgba(0,0,0,.48)" strokeWidth="1.5" />
        : geometry.ellipse
          ? <ellipse cx="100" cy="100" rx="82" ry="64" fill={`url(#${gradientId})`} stroke="rgba(0,0,0,.48)" strokeWidth="1.5" />
          : <path d={geometry.outer} fill={`url(#${gradientId})`} stroke="rgba(0,0,0,.48)" strokeWidth="1.5" strokeLinejoin="round" />}
      {geometry.circle
        ? <circle cx="100" cy="100" r="77" fill="none" stroke="#d6c18c" strokeWidth="1.2" />
        : geometry.ellipse
          ? <ellipse cx="100" cy="100" rx="81" ry="63" fill="none" stroke="#d6c18c" strokeWidth="1.2" />
          : <path d={geometry.outer} fill="none" stroke="#d6c18c" strokeWidth="1.2" strokeLinejoin="round" />}
      {geometry.circle
        ? <circle cx="100" cy="100" r="60" fill={`url(#${gradientId})`} stroke="#d6c18c" strokeWidth="1.1" />
        : geometry.ellipse
          ? <ellipse cx="100" cy="100" rx="62" ry="46" fill={`url(#${gradientId})`} stroke="#d6c18c" strokeWidth="1.1" />
          : renderShape(geometry.inner, true)}
      {geometry.circle
        ? <circle cx="100" cy="100" r="58" fill="none" stroke="#d6c18c" strokeOpacity=".42" />
        : geometry.ellipse
          ? <ellipse cx="100" cy="100" rx="60" ry="44" fill="none" stroke="#d6c18c" strokeOpacity=".42" />
          : <path d={geometry.inner} fill="none" stroke="#d6c18c" strokeOpacity=".42" strokeWidth=".8" />}
      {geometry.circle
        ? <circle cx="100" cy="100" r="59" fill={`url(#${gradientId}-shine)`} />
        : geometry.ellipse
          ? <ellipse cx="100" cy="100" rx="61" ry="45" fill={`url(#${gradientId}-shine)`} />
          : <path d={geometry.inner} fill={`url(#${gradientId}-shine)`} />}
      <circle cx="100" cy="100" r="24" fill="none" stroke="#d6c18c" strokeOpacity=".45" strokeWidth=".8" />
      <circle cx="100" cy="100" r="19" fill="none" stroke="#d6c18c" strokeOpacity=".25" strokeWidth=".6" />
      {shape === "relic-4" && (
        <g fill="none" stroke="#d6c18c" strokeOpacity=".6" strokeWidth="1">
          <path d="M100 63 C83 72 82 88 100 99 C118 88 117 72 100 63Z" />
          <path d="M100 137 C83 128 82 112 100 101 C118 112 117 128 100 137Z" />
          <path d="M63 100 C72 83 88 82 99 100 C88 118 72 117 63 100Z" />
          <path d="M137 100 C128 83 112 82 101 100 C112 118 128 117 137 100Z" />
        </g>
      )}
    </svg>
  );
}
