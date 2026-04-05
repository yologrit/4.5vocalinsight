import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Music, CheckCircle2 } from "lucide-react";

const questions = [
  {
    title: "你目前在唱歌方面最大的目标是？",
    subtitle: "What's your biggest goal in singing?",
    options: [
      "纯粹为了娱乐，享受唱歌的过程",
      "我想唱我喜欢的偶像的歌",
      "搞定某首特定的高难度歌曲",
      "我想更自然地表达情绪",
      "我想发翻唱 / 录视频",
      "我想系统提升唱功",
    ],
    multi: false,
  },
  {
    title: "哪种最符合你现在的情况？",
    subtitle: "What best describes your current level?",
    options: [
      "我喜欢唱歌，但没学过",
      "我会自己跟着教程练",
      "我上过 / 正在上声乐课",
      "我经常录翻唱或在人前唱歌",
      "我是一名职业歌手/音乐家",
    ],
    multi: false,
  },
  {
    title: "你学一首歌时最常卡在哪一步？",
    subtitle: "Where do you usually get stuck?",
    options: [
      "听不出来原唱这句到底怎么唱",
      "练了但不知道自己唱得对不对",
      "问题很多，不知道先练哪一句",
      "看了教程还是不会迁移到自己的演唱里",
    ],
    multi: false,
  },
  {
    title: "你现在最想提升哪些方面？",
    subtitle: "What do you want to improve most? (Multi-select)",
    options: [
      "听懂原唱具体怎么唱",
      "先让我看看我目前的问题在哪",
      "音准控制",
      "呼吸控制",
      "按节奏唱歌",
      "在特定音区中演唱/切换",
      "演唱更高或更低的音符",
    ],
    multi: true,
  },
  {
    title: "你相信通过科学练习，唱歌水平能显著提升吗？",
    subtitle: "Do you believe in the power of practice?",
    options: [
      "相信，我愿意投入时间",
      "半信半疑，想看看效果",
      "我觉得自己没天赋，纯属来试试",
    ],
    multi: false,
    responses: [
      "太棒了！看来你已经准备好开启专业练习了。让我们开始吧！🎵",
      "很坦诚！很多歌手起初也是这样。别担心，我的分析数据会用事实告诉你进步的轨迹，先练一句试试看？",
      "很多人以为唱歌靠天赋，其实它本质是一场关于肌肉记忆的控制科学。让我做你的引路人，陪你发现那个会唱歌的自己。🎤",
    ],
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(string | string[])[]>(Array(questions.length).fill(""));
  const [showResponse, setShowResponse] = useState(false);

  const current = questions[step];
  const isLast = step === questions.length - 1;

  const handleSelect = (option: string) => {
    if (current.multi) {
      const prev = (answers[step] as string[]) || [];
      const next = prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option];
      const newAnswers = [...answers];
      newAnswers[step] = next;
      setAnswers(newAnswers);
    } else {
      const newAnswers = [...answers];
      newAnswers[step] = option;
      setAnswers(newAnswers);

      if (isLast && current.responses) {
        setShowResponse(true);
      } else if (!isLast) {
        // Auto-advance for single-select non-last questions
        setTimeout(() => {
          setStep(step + 1);
          setShowResponse(false);
        }, 300);
      }
    }
  };

  const selectedForStep = answers[step];
  const hasSelection = current.multi
    ? (selectedForStep as string[])?.length > 0
    : !!selectedForStep;

  const handleNext = () => {
    if (isLast) {
      navigate("/coach");
    } else {
      setStep(step + 1);
      setShowResponse(false);
    }
  };

  const responseIndex = isLast && current.responses
    ? current.options.indexOf(selectedForStep as string)
    : -1;

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Music className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm">VocalInsight</span>
        </div>
        <span className="text-sm text-muted-foreground">{step + 1} / {questions.length}</span>
      </div>

      {/* Progress */}
      <div className="px-4 md:px-8">
        <div className="h-1 bg-muted rounded-full overflow-hidden max-w-lg mx-auto">
          <div
            className="h-full bg-gradient-primary rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg animate-fade-in" key={step}>
          <p className="text-xs text-muted-foreground mb-2">{current.subtitle}</p>
          <h2 className="text-xl md:text-2xl font-bold mb-8">{current.title}</h2>

          <div className="space-y-3">
            {current.options.map((option, i) => {
              const isSelected = current.multi
                ? (selectedForStep as string[])?.includes(option)
                : selectedForStep === option;

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 text-sm ${
                    isSelected
                      ? "border-primary bg-accent text-foreground shadow-glow"
                      : "border-border bg-card text-foreground hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    {option}
                  </div>
                </button>
              );
            })}
          </div>

          {/* AI Response for last question */}
          {showResponse && responseIndex >= 0 && (
            <div className="mt-6 p-4 rounded-xl bg-accent border border-primary/20 text-sm animate-fade-in">
              <p className="text-accent-foreground leading-relaxed">
                {current.responses![responseIndex]}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-10">
            <Button
              variant="ghost"
              onClick={() => { setStep(Math.max(0, step - 1)); setShowResponse(false); }}
              disabled={step === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> 上一步
            </Button>
            {(current.multi || isLast) && (
              <Button
                variant="hero"
                onClick={handleNext}
                disabled={!hasSelection}
              >
                {isLast ? "开始练习" : "下一步"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
