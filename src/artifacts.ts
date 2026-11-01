import { publicAsset } from "./paths";

export const TARGET_ARTIFACT_ID =
  "black-lacquer-mother-of-pearl-octagonal-bird-flower-plate";

export type VesselCategoryId = "geometric" | "animal" | "relic";

export interface HistoricalArtifact {
  id: string;
  name: string;
  era?: string;
  shape: string;
  description: string;
  category: VesselCategoryId;
  image?: string;
  available: boolean;
}

export const VESSEL_CATEGORIES: { id: VesselCategoryId; label: string; en: string }[] = [
  { id: "geometric", label: "几何器型", en: "GEOMETRIC" },
  { id: "animal", label: "动物器型", en: "ANIMAL" },
  { id: "relic", label: "历史文物", en: "RELIC" },
];

export const HISTORICAL_ARTIFACTS: HistoricalArtifact[] = [
  { id: "geo-round", name: "圆盘", shape: "round", description: "器型端正，包容万象，为漆盘最经典之形制。", category: "geometric", available: false },
  { id: "geo-square", name: "方盘", shape: "square", description: "四隅平直，端庄稳重，呈现传统方器的秩序之美。", category: "geometric", available: false },
  { id: "geo-hexagon", name: "六方盘", shape: "hexagon", description: "六边对称，棱角含蓄而规整。", category: "geometric", available: false },
  { id: "geo-oval", name: "椭圆盘", shape: "oval", description: "修长婉转，线条温润舒展。", category: "geometric", available: false },
  { id: "geo-octagon", name: "八方盘", shape: "octagon", description: "八方合一，形制端庄大气。", category: "geometric", available: false },
  { id: "animal-cat", name: "猫脸盘", shape: "cat", description: "双耳垂立，盘口取猫面轮廓，器身仍为盘状。", category: "animal", available: false },
  { id: "animal-rabbit", name: "兔耳盘", shape: "rabbit", description: "双耳修挺上举，造型灵动而克制。", category: "animal", available: false },
  { id: "animal-butterfly", name: "蝴蝶盘", shape: "butterfly", description: "双翅对称铺展，轻盈舒展，盘面平整。", category: "animal", available: false },
  { id: "animal-fish", name: "鱼形盘", shape: "fish", description: "含鱼头、鱼身与尾，轮廓清晰完整。", category: "animal", available: false },
  { id: "animal-bird", name: "鸟形盘", shape: "bird", description: "敛羽静立，取鸟形简括外廓，简洁易辨。", category: "animal", available: false },
  {
    id: "relic-weijiao",
    name: "黑漆嵌螺钿人物故事图委角方盘",
    era: "清代",
    shape: "relic-1",
    image: publicAsset("/artifact-images/relic-01.jpg"),
    description: "黑漆为地，嵌螺钿表现乘舟游赏、山水楼阁，委角含蓄。",
    category: "relic",
    available: false,
  },
  {
    id: "relic-mumei",
    name: "黑漆描金五福捧寿纹葵瓣式盘",
    era: "清代",
    shape: "relic-2",
    image: publicAsset("/artifact-images/relic-02.jpg"),
    description: "葵瓣花口，黑地描金绘蝙蝠与缠枝花纹，寓意吉祥。",
    category: "relic",
    available: false,
  },
  {
    id: "relic-huakou",
    name: "黑漆嵌螺钿花卉纹花口盘",
    era: "清代",
    shape: "relic-3",
    image: publicAsset("/artifact-images/relic-03.jpg"),
    description: "花口菱边形制，盘心以五彩螺钿嵌饰花树。",
    category: "relic",
    available: false,
  },
  {
    id: TARGET_ARTIFACT_ID,
    name: "黑漆嵌螺钿花鸟纹八方盘",
    era: "清代",
    shape: "relic-4",
    description: "八方形制规整，盘心螺钿嵌花鸟，八边饰折枝花卉。",
    category: "relic",
    image: publicAsset("/craft-images/步骤3状态0.png"),
    available: true,
  },
  {
    id: "relic-yuanpan",
    name: "黑漆嵌螺钿人物庭院图圆盘",
    era: "清代",
    shape: "relic-5",
    image: publicAsset("/artifact-images/relic-05.jpg"),
    description: "圆形盘体，螺钿装饰人物庭院与花木，富有叙事意趣。",
    category: "relic",
    available: false,
  },
];

export type LacquerColor = "vermilion" | "black" | "green" | "ivory" | "gold";

export const LACQUER_COLORS: { id: LacquerColor; label: string; hex: string }[] = [
  { id: "vermilion", label: "朱红", hex: "#A8322D" },
  { id: "black", label: "漆黑", hex: "#20211E" },
  { id: "green", label: "松绿", hex: "#496451" },
  { id: "ivory", label: "米白", hex: "#E8DFCC" },
  { id: "gold", label: "暗金", hex: "#B69A62" },
];

export const RELIC_ALLOWED_COLORS: LacquerColor[] = ["vermilion", "black"];

export function getArtifact(id: string | null | undefined) {
  return HISTORICAL_ARTIFACTS.find((artifact) => artifact.id === id);
}

export function getCategoryArtifacts(category: VesselCategoryId) {
  return HISTORICAL_ARTIFACTS.filter((artifact) => artifact.category === category);
}

export function getLacquer(id: string | null | undefined) {
  return LACQUER_COLORS.find((color) => color.id === id);
}
