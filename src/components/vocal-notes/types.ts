export interface TechniqueTag {
  text: string;
  type: "vibrato" | "chest" | "falsetto" | "mixed" | "glissando" | "straight" | "breath";
  startIdx: number;
  endIdx: number;
}

export interface LyricLine {
  lyrics: string;
  translation?: string;
  techniques: TechniqueTag[];
  breathMark?: boolean;
}

export const techniqueColors: Record<string, string> = {
  vibrato: "bg-info/15 text-info border-info/30",
  chest: "bg-success/15 text-success border-success/30",
  falsetto: "bg-warning/15 text-warning border-warning/30",
  mixed: "bg-primary/15 text-primary border-primary/30",
  glissando: "bg-destructive/15 text-destructive border-destructive/30",
  straight: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
  breath: "bg-accent text-accent-foreground border-border",
};

// Raw color values for gradient use
export const techniqueRawColors: Record<string, string> = {
  vibrato: "hsl(200,80%,50%)",
  chest: "hsl(152,60%,42%)",
  falsetto: "hsl(38,92%,50%)",
  mixed: "hsl(245,58%,51%)",
  glissando: "hsl(0,72%,51%)",
  straight: "hsl(152,60%,42%)",
};

// Text colors applied directly to lyric characters covered by a technique
export const techniqueTextColors: Record<string, string> = {
  vibrato: "text-[hsl(200,80%,50%)]",
  chest: "text-[hsl(152,60%,42%)]",
  falsetto: "text-[hsl(38,92%,50%)]",
  mixed: "text-[hsl(245,58%,51%)]",
  glissando: "text-[hsl(0,72%,51%)]",
};

export const techniqueLabels: Record<string, { cn: string; en: string }> = {
  vibrato: { cn: "颤音", en: "Vibrato" },
  chest: { cn: "真声", en: "Chest Voice" },
  falsetto: { cn: "假声", en: "Falsetto" },
  mixed: { cn: "混声", en: "Mixed Voice" },
  glissando: { cn: "滑音", en: "Glissando" },
  straight: { cn: "直音", en: "Straight Tone" },
  breath: { cn: "换气", en: "Breath" },
  "mixed-falsetto": { cn: "混声 → 假声", en: "Mixed to Falsetto" },
  "falsetto-straight": { cn: "假声 → 直音", en: "Falsetto to Straight" },
  "chest-mixed": { cn: "真声 → 混声", en: "Chest to Mixed" },
};

export const techniqueDetails: Record<string, { description: string; tip: string }> = {
  vibrato: {
    description: "音高以 5-7Hz 频率周期性微幅波动，常出现在长音尾部，为声音增添温暖感和表现力。",
    tip: "练习时可先用均匀的气息支撑长音，再逐渐加入轻微的横膈膜脉动。",
  },
  chest: {
    description: "声带完全闭合振动的发声模式，音色饱满有力，多用于中低音区。",
    tip: "保持喉位稳定，感受胸腔共鸣，注意不要过度用力挤压。",
  },
  falsetto: {
    description: "声带边缘振动的发声模式，音色轻柔空灵，多用于高音区。",
    tip: "放松喉部肌肉，用气息推动发声，想象声音从头顶飘出。",
  },
  mixed: {
    description: "真声与假声的混合状态，既有力度又不失灵活，是流行唱法中最重要的技巧之一。",
    tip: "在真假声交界处寻找平衡点，保持气息支撑，避免直接「推」上去。",
  },
  glissando: {
    description: "音高在两个音之间平滑滑动，为旋律增加流畅感和情感表达。",
    tip: "控制滑动速度和幅度，避免过快或幅度过大，保持气息连贯。",
  },
  straight: {
    description: "音高稳定无波动，音色纯净明亮，常用于特定情感表达或风格需求。",
    tip: "保持均匀的气息支撑，专注于音高的精确控制。",
  },
  "mixed-falsetto": {
    description: "从混声平滑过渡到假声。这要求声带振动模式从较厚的混合状态切换到较薄的边缘振动，同时保持气息的连贯性，避免明显的断层（换声点）。",
    tip: "在过渡时逐渐减少声带的闭合力度，增加气息的流动感，想象声音从口腔共鸣向头腔共鸣平滑移动。",
  },
  "falsetto-straight": {
    description: "从轻盈的假声切换到坚定的直音。这种转换常用于情感的转折，从柔和的诉说转向坚定的表达。",
    tip: "在切换瞬间加强声带闭合，同时保持气息支撑，确保音色的突变是可控且有意的。",
  },
  "chest-mixed": {
    description: "从厚实的真声过渡到平衡的混声。这是向上攀升音高时的关键技术，能保持音色的统一性。",
    tip: "随着音高上升，逐渐将共鸣点向上移动，减少胸腔共鸣的比例，增加面罩共鸣。",
  },
};

export const mockLyrics: LyricLine[] = [
  {
    lyrics: "我曾将青春翻涌成她",
    techniques: [
      { text: "真声", type: "chest", startIdx: 0, endIdx: 4 },
    ],
    breathMark: false,
  },
  {
    lyrics: "也曾指尖弹出盛夏",
    techniques: [
      { text: "滑音", type: "glissando", startIdx: 3, endIdx: 5 },
    ],
    breathMark: true,
  },
  {
    lyrics: "心之所动 且就随缘去吧",
    techniques: [
      { text: "混声", type: "mixed", startIdx: 0, endIdx: 4 },
      { text: "颤音", type: "vibrato", startIdx: 7, endIdx: 9 },
    ],
    breathMark: false,
  },
  {
    lyrics: "逆着光行走 任风吹雨打",
    techniques: [
      { text: "假声", type: "falsetto", startIdx: 0, endIdx: 5 },
      { text: "直音", type: "straight", startIdx: 5, endIdx: 11 },
    ],
    breathMark: true,
  },
  {
    lyrics: "短短的路走走停停",
    techniques: [
      { text: "真声", type: "chest", startIdx: 0, endIdx: 8 },
    ],
  },
  {
    lyrics: "也有了几分的距离",
    techniques: [
      { text: "混声", type: "mixed", startIdx: 2, endIdx: 7 },
    ],
    breathMark: true,
  },
  {
    lyrics: "不知不觉 已经翻山越岭",
    techniques: [
      { text: "混声", type: "mixed", startIdx: 5, endIdx: 7 },
      { text: "假声", type: "falsetto", startIdx: 7, endIdx: 9 },
    ],
  },
];
