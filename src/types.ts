import { publicAsset } from "./paths";

export const STEP_NAMES = [
  "描纹定样",
  "初髹黑漆",
  "拾贝镶嵌",
  "复髹罩漆",
  "拭漆显贝",
  "罩清提光",
  "磨光成器",
] as const;

export type StepName = (typeof STEP_NAMES)[number];

export const MOTIFS = [
  { id: "plum", label: "疏影横斜", image: publicAsset("/craft-images/步骤3素材1.png"), positions: [{ x: 38, y: 65 }] },
  { id: "bird", label: "啼鸟春深", image: publicAsset("/craft-images/步骤3素材2.png"), positions: [{ x: 57, y: 55 }] },
  {
    id: "flanking-flowers",
    label: "锦簇华章",
    image: publicAsset("/craft-images/步骤3素材3.png"),
    positions: [{ x: 22, y: 49 }, { x: 78, y: 49 }],
  },
  { id: "crown", label: "冠上繁英", image: publicAsset("/craft-images/步骤3素材4.png"), positions: [{ x: 50, y: 23 }] },
] as const;

export type InteractionProgress = number[];
