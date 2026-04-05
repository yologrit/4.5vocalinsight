export interface AnalysisTechnique {
  type: string;
  cn: string;
  en: string;
  accuracy: number; // 0-100
  stability: number; // 0-100
  description: string;
  tip: string;
  startIdx: number;
  endIdx: number;
  analysis?: {
    conclusion: string;
    metrics: {
      pitchFit: number;
      breathSmoothness: number;
      longNoteStability: number;
      techniqueAchievement: string;
      techniqueAchievementScore: number;
    };
    details: {
      category: "A" | "B" | "C";
      summary: string[];
      visualType: "stability" | "mode" | "trajectory";
      data: {
        originalMode?: string;
        userMode?: string;
        confidence?: string;
        stabilityLevel?: string;
        direction?: string;
        advice?: string;
        transitionState?: string;
        fromLabel?: string;
        toLabel?: string;
        hideComparison?: boolean;
      };
    };
  };
}

export interface AnalysisLyricLine {
  lyrics: string;
  originalPitch: number[]; // Array of pitch values
  userPitch: number[]; // Array of pitch values
  techniques: AnalysisTechnique[];
  charAccuracy: number[]; // Accuracy per character (0-100)
  startTime: number;
  endTime: number;
  overallScore: number; // 1-5 stars
  breathMark?: boolean;
  userBreathErrors?: number[];
}

export const mockAnalysisData: AnalysisLyricLine[] = [
  {
    lyrics: "我曾将青春翻涌成她",
    startTime: 0,
    endTime: 4,
    originalPitch: [60, 62, 64, 65, 67, 65, 64, 62, 60],
    userPitch: [60, 61, 63, 65, 66, 64, 63, 61, 59],
    charAccuracy: [95, 92, 91, 90, 90, 75, 65, 40, 25, 20],
    overallScore: 4,
    techniques: [
      {
        type: "chest",
        cn: "真声",
        en: "Chest Voice",
        accuracy: 92,
        stability: 88,
        description: "声带完全闭合振动的发声模式，音色饱满有力。",
        tip: "保持喉位稳定，感受胸腔共鸣。",
        startIdx: 0,
        endIdx: 4,
        analysis: {
          conclusion: "本句识别为【真声】，目前问题是：尾音共鸣略显单薄",
          metrics: {
            pitchFit: 88,
            breathSmoothness: 75,
            longNoteStability: 82,
            techniqueAchievement: "中",
            techniqueAchievementScore: 85,
          },
          details: {
            category: "A",
            summary: ["尾音略有下滑趋势", "支撑力度在后半段有所减弱"],
            visualType: "stability",
            data: {
              originalMode: "稳定",
              userMode: "下滑",
              stabilityLevel: "中",
              direction: "下滑",
              advice: "先单练尾音保持，再回到整句练长音支撑。"
            }
          }
        }
      }
    ],
    userBreathErrors: [4]
  },
  {
    lyrics: "也曾指尖弹出盛夏",
    startTime: 4,
    endTime: 8,
    originalPitch: [65, 67, 69, 71, 72, 71, 69, 67],
    userPitch: [65, 66, 68, 70, 71, 70, 68, 66],
    charAccuracy: [85, 88, 92, 75, 72, 65, 55, 45],
    overallScore: 3,
    techniques: [
      {
        type: "glissando",
        cn: "滑音",
        en: "Glissando",
        accuracy: 75,
        stability: 68,
        description: "音高在两个音之间平滑滑动。",
        tip: "控制滑动速度，保持气息连贯。",
        startIdx: 3,
        endIdx: 5,
        analysis: {
          conclusion: "本句识别为【滑音】，目前问题是：滑动过程音准偏移",
          metrics: {
            pitchFit: 72,
            breathSmoothness: 65,
            longNoteStability: 58,
            techniqueAchievement: "中",
            techniqueAchievementScore: 70,
          },
          details: {
            category: "C",
            summary: ["滑音起点准确", "滑动过程略显生硬", "终点音高略低"],
            visualType: "trajectory",
            data: {
              direction: "直接到位",
              stabilityLevel: "中",
              advice: "先夸张地把滑入感唱出来，再逐步缩回到自然状态。"
            }
          }
        }
      }
    ],
    breathMark: true,
    userBreathErrors: [2]
  },
  {
    lyrics: "心之所动 且就随缘去吧",
    startTime: 8,
    endTime: 14,
    originalPitch: [67, 69, 71, 72, 74, 72, 71, 69, 67, 65, 64, 62],
    userPitch: [67, 68, 70, 72, 73, 71, 70, 68, 66, 64, 63, 61],
    charAccuracy: [90, 92, 95, 98, 85, 75, 65, 85, 82, 80, 78, 75],
    overallScore: 4,
    techniques: [
      {
        type: "mixed",
        cn: "混声",
        en: "Mixed Voice",
        accuracy: 92,
        stability: 85,
        description: "真声与假声的混合状态。",
        tip: "寻找平衡点，避免直接推上去。",
        startIdx: 0,
        endIdx: 4,
        analysis: {
          conclusion: "本段识别为【混声】，目前问题是：共鸣点偏后",
          metrics: {
            pitchFit: 92,
            breathSmoothness: 85,
            longNoteStability: 80,
            techniqueAchievement: "高",
            techniqueAchievementScore: 92,
          },
          details: {
            category: "B",
            summary: ["混声比例协调", "气息支撑稳定", "建议共鸣点前移"],
            visualType: "mode",
            data: {
              originalMode: "混声",
              userMode: "混声",
              confidence: "判断明确"
            }
          }
        }
      },
      {
        type: "vibrato",
        cn: "颤音",
        en: "Vibrato",
        accuracy: 92,
        stability: 80,
        description: "音高周期性微幅波动。",
        tip: "用均匀气息支撑，加入轻微脉动。",
        startIdx: 7,
        endIdx: 12,
        analysis: {
          conclusion: "本段识别为【颤音】，目前问题是：颤音频率略快",
          metrics: {
            pitchFit: 85,
            breathSmoothness: 82,
            longNoteStability: 78,
            techniqueAchievement: "高",
            techniqueAchievementScore: 90,
          },
          details: {
            category: "A",
            summary: ["颤音频率：6.5Hz (略快)", "幅度控制良好", "尾音处理自然"],
            visualType: "stability",
            data: {
              stabilityLevel: "高",
              direction: "持平",
              advice: "颤音频率虽快但控制力很强，听感上富有生命力。"
            }
          }
        }
      }
    ],
    userBreathErrors: [5]
  },
  {
    lyrics: "逆着光行走 任风吹雨打",
    startTime: 14,
    endTime: 20,
    originalPitch: [72, 74, 76, 77, 79, 77, 76, 74, 72, 70, 69],
    userPitch: [72, 73, 75, 77, 78, 76, 75, 73, 71, 69, 68],
    charAccuracy: [45, 48, 52, 55, 42, 60, 50, 40, 30, 20, 10],
    overallScore: 3,
    techniques: [
      {
        type: "falsetto-straight",
        cn: "假声 → 直音",
        en: "Falsetto to Straight",
        accuracy: 45,
        stability: 72,
        description: "从假声平滑过渡到直音。",
        tip: "放松喉部，保持均匀气息支撑。",
        startIdx: 0,
        endIdx: 5,
        analysis: {
          conclusion: "本句识别为【假声→直音】，目前问题是：换声点有明显断层",
          metrics: {
            pitchFit: 75,
            breathSmoothness: 48,
            longNoteStability: 62,
            techniqueAchievement: "低",
            techniqueAchievementScore: 55,
          },
          details: {
            category: "B",
            summary: ["假声段气息略虚", "换声点：G4 (有断层)", "直音段音准稳定"],
            visualType: "mode",
            data: {
              originalMode: "混声 (稳定)",
              userMode: "偏真声直推",
              confidence: "判断较明确",
              transitionState: "过渡区",
              fromLabel: "假声",
              toLabel: "直音",
              hideComparison: true,
              advice: "建议先放慢速度，只练进入高音前两个字的换声衔接。建议先单独练尾音和换声衔接。"
            }
          }
        }
      }
    ],
    breathMark: true,
    userBreathErrors: [6]
  },
  {
    lyrics: "短短的路走走停停",
    startTime: 20,
    endTime: 25,
    originalPitch: [60, 62, 64, 65, 67, 65, 64, 62, 60],
    userPitch: [60, 61, 63, 65, 66, 64, 63, 61, 59],
    charAccuracy: [95, 96, 94, 92, 95, 93, 91, 90, 92],
    overallScore: 5,
    techniques: [
      {
        type: "chest",
        cn: "真声",
        en: "Chest Voice",
        accuracy: 95,
        stability: 92,
        description: "声带完全闭合振动。",
        tip: "保持喉位稳定。",
        startIdx: 0,
        endIdx: 8,
        analysis: {
          conclusion: "本句识别为【真声】，表现非常出色",
          metrics: {
            pitchFit: 96,
            breathSmoothness: 92,
            longNoteStability: 94,
            techniqueAchievement: "高",
            techniqueAchievementScore: 95,
          },
          details: {
            category: "A",
            summary: ["力度支撑充足", "音准贴合度极高", "咬字清晰自然"],
            visualType: "stability",
            data: {
              stabilityLevel: "高",
              direction: "持平",
              advice: "这句真声表现非常稳定，气息支撑到位，继续保持。"
            }
          }
        }
      }
    ],
    userBreathErrors: []
  },
  {
    lyrics: "也有了几分的距离",
    startTime: 25,
    endTime: 30,
    originalPitch: [65, 67, 69, 71, 72, 71, 69, 67],
    userPitch: [65, 66, 68, 70, 71, 70, 68, 66],
    charAccuracy: [85, 88, 92, 95, 80, 65, 55, 45],
    overallScore: 3,
    techniques: [
      {
        type: "mixed",
        cn: "混声",
        en: "Mixed Voice",
        accuracy: 75,
        stability: 75,
        description: "真假声混合状态。",
        tip: "增加面罩共鸣。",
        startIdx: 2,
        endIdx: 7,
        analysis: {
          conclusion: "本句识别为【混声】，目前问题是：中音区共鸣不足",
          metrics: {
            pitchFit: 78,
            breathSmoothness: 72,
            longNoteStability: 65,
            techniqueAchievement: "中",
            techniqueAchievementScore: 75,
          },
          details: {
            category: "B",
            summary: ["混声比例偏真", "气息支撑略显疲劳", "音准有小幅偏移"],
            visualType: "mode",
            data: {
              originalMode: "混声",
              userMode: "偏真声",
              confidence: "判断较明确"
            }
          }
        }
      }
    ],
    breathMark: true
  },
  {
    lyrics: "不知不觉 已经翻山越岭",
    startTime: 30,
    endTime: 36,
    originalPitch: [60, 62, 64, 65, 67, 65, 64, 62, 60, 58],
    userPitch: [60, 61, 63, 65, 66, 64, 63, 61, 59, 57],
    charAccuracy: [95, 92, 88, 85, 90, 82, 80, 78, 75, 72],
    overallScore: 4,
    techniques: [
      {
        type: "mixed-falsetto",
        cn: "混声 → 假声",
        en: "Mixed to Falsetto",
        accuracy: 82,
        stability: 75,
        description: "从混声平滑过渡到假声。",
        tip: "过渡时减少闭合力度。",
        startIdx: 5,
        endIdx: 9,
        analysis: {
          conclusion: "本句识别为【混声→假声】，目前问题是：假声段气息略虚",
          metrics: {
            pitchFit: 82,
            breathSmoothness: 75,
            longNoteStability: 70,
            techniqueAchievement: "中",
            techniqueAchievementScore: 80,
          },
          details: {
            category: "B",
            summary: ["混声段衔接自然", "换声点处理平滑", "假声段气息支撑可加强"],
            visualType: "mode",
            data: {
              originalMode: "混声 (稳定)",
              userMode: "假声 (偏虚)",
              confidence: "判断明确",
              transitionState: "过渡区",
              fromLabel: "混声",
              toLabel: "假声",
              hideComparison: true,
              advice: "过渡到假声时，注意保持气息的连贯性，避免声音突然断掉。建议增加气息支撑的稳定性。"
            }
          }
        }
      }
    ]
  }
];

