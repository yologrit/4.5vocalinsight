import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, ArrowRight, Sparkles, BarChart3, Mic, Target, Users, Headphones, Star } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react";
import featureAnalyze from "@/assets/feature-analyze.jpg";
import featureCompare from "@/assets/feature-compare.jpg";
import featurePractice from "@/assets/feature-practice.jpg";

/* ========== Waveform Hero Animation ========== */
const WaveformHeroAnimation = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let active = true;
    const run = async () => {
      while (active) {
        setPhase(0);
        await new Promise(r => setTimeout(r, 1500));
        if (!active) break;
        setPhase(1);
        await new Promise(r => setTimeout(r, 2500));
        if (!active) break;
        setPhase(2);
        await new Promise(r => setTimeout(r, 2500));
        if (!active) break;
        setPhase(3);
        await new Promise(r => setTimeout(r, 2500));
      }
    };
    run();
    return () => { active = false; };
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto h-48 md:h-64 flex items-center justify-center overflow-hidden">
      <motion.svg
        viewBox="0 0 600 120"
        className="absolute w-full h-28 md:h-36"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 0 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {[...Array(60)].map((_, i) => {
          const h = 20 + Math.sin(i * 0.3) * 30 + Math.cos(i * 0.15) * 20;
          return (
            <motion.rect
              key={i}
              x={i * 10}
              y={60 - h / 2}
              width={6}
              height={h}
              rx={3}
              fill="hsl(245, 58%, 51%)"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.02, duration: 0.4 }}
              style={{ transformOrigin: "center" }}
            />
          );
        })}
      </motion.svg>

      <AnimatePresence>
        {phase === 1 && (
          <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {["混声", "颤音", "换气", "真声", "假声", "滑音", "气息", "高音"].map((label, i) => (
                <motion.div key={label} initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }} className="px-3 py-1.5 rounded-lg text-sm font-bold border" style={{ background: `hsl(${200 + i * 20}, 60%, 92%)`, color: `hsl(${200 + i * 20}, 60%, 35%)`, borderColor: `hsl(${200 + i * 20}, 60%, 80%)` }}>
                  {label}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 2 && (
          <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <svg viewBox="0 0 500 120" className="w-full max-w-lg h-28 md:h-36">
              <motion.path d="M10,60 Q50,20 90,55 T170,45 T250,60 T330,50 T410,55 T490,60" fill="none" stroke="hsl(245, 58%, 51%)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
              <motion.path d="M10,65 Q50,30 90,70 T170,35 T250,72 T330,40 T410,68 T490,58" fill="none" stroke="hsl(152, 60%, 42%)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />
              {[90, 170, 250, 330, 410].map((x, i) => (
                <motion.line key={i} x1={x} y1={[55, 45, 60, 50, 55][i]} x2={x} y2={[70, 35, 72, 40, 68][i]} stroke="hsl(0, 72%, 51%)" strokeWidth="2" strokeDasharray="4,3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + i * 0.15 }} />
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 3 && (
          <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col items-center gap-3">
              <motion.div 
                className="px-4 py-2 rounded-full bg-primary/10 text-primary font-bold border border-primary/20 flex items-center gap-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                <Target className="w-4 h-4" />
                针对性练习方案
              </motion.div>
              <div className="flex gap-2">
                {["气息控制", "音准微调", "高音突破"].map((item, i) => (
                  <motion.div 
                    key={item}
                    className="px-3 py-1 bg-card text-xs font-semibold rounded-md border shadow-sm text-muted-foreground"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.15 }}
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 flex gap-6 text-xs font-bold text-muted-foreground">
        {["① 拆解", "② 纠错", "③ 建议"].map((label, i) => (
          <motion.span key={label} animate={{ color: phase === i + 1 ? "hsl(245, 58%, 51%)" : undefined }} className="transition-colors">
            {label}
          </motion.span>
        ))}
      </div>
    </div>
  );
};

/* ========== Scroll-telling ========== */
const coreFeatures = [
  { step: "Step 1 · 拆解", title: "原唱怎么唱的？", description: "告别凭感觉瞎猜。AI 自动生成声乐笔记，帮你拆解换气点和关键技巧。", image: featureAnalyze },
  { step: "Step 2 · 纠错", title: "我唱对了吗？", description: "不只只有个干瘪的总分。AI 逐句对比你的练唱和参考唱段，精准指出音高、节奏与技巧偏差。", image: featureCompare },
  { step: "Step 3 · 建议", title: "应该先练什么？", description: "问题太多不知从何练起？自动识别最核心的问题，为你定制循序渐进的微练习，让进步看得见。", image: featurePractice },
];

const ScrollTellingSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setActiveIndex(Math.min(2, Math.floor(v * 3))));

  return (
    <section ref={containerRef} className="relative" style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 flex flex-col md:flex-row gap-8 md:gap-16 items-center">
          <div className="flex-1 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div key={activeIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4 }}>
                <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">{coreFeatures[activeIndex].step}</span>
                <h3 className="text-2xl md:text-4xl font-bold mb-4">{coreFeatures[activeIndex].title}</h3>
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">{coreFeatures[activeIndex].description}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-2 pt-6">
              {coreFeatures.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIndex ? "w-10 bg-primary" : "w-4 bg-border"}`} />
              ))}
            </div>
          </div>
          <div className="flex-1 max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div key={activeIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }} className="rounded-2xl overflow-hidden border border-border shadow-lg">
                <img src={coreFeatures[activeIndex].image} alt={coreFeatures[activeIndex].title} className="w-full h-auto" loading="lazy" width={800} height={600} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const advantages = [
  { icon: BarChart3, title: "比 K 歌打分更专业", subtitle: "看到差距，不只看结果", description: "不只给出一个分数，而是把原唱的唱法和你的真实差距，精准拆解到每一个具体句段。" },
  { icon: Mic, title: "比免费教程更高效", subtitle: "双向互动，告别单向盲猜", description: `不知道原唱用了什么技巧？看视频自学没人纠错？AI 先为你拆解唱法指明方向，再对你的练习提供专属反馈，让自学告别\u201C单向输入\u201D。` },
  { icon: Star, title: "比私教更有性价比", subtitle: "低门槛打基础，钱花在刀刃上", description: "初学期的找音准、练气息，请私教门槛太高。先用极低成本让 AI 帮你打好基本功，等需要进阶时，再去线下找老师。" },
];

const personas = [
  { icon: Users, tag: "零基础小白", title: "告别听不懂、学不会", description: `听不出原唱技巧？不知道怎么起步？AI 化身\u201C声乐翻译官\u201D，把复杂唱法变成通俗易懂的图文笔记，带你迈出正确的第一步。` },
  { icon: Headphones, tag: "进阶自学者", title: "告别盲目练、没反馈", description: `看视频\u201C一看就会，一唱就废\u201D？AI 填补你自学过程中的反馈空白，对你的练习进行逐句纠错，确保你的每次张口都在正确的轨道上。` },
  { icon: Target, tag: "翻唱创作者", title: "告别差口气、低效率", description: `录音总觉得细节不完美？AI 作为你的\u201C出片加速器\u201D，精准定位瑕疵句段，帮你精雕细琢，提供发布前的专业级体检。` },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [hoveredAdv, setHoveredAdv] = useState<number | null>(null);
  const [activePersona, setActivePersona] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Music className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-gradient-primary">VocalInsight</span>
              <span className="text-muted-foreground ml-1 text-sm font-normal">析音</span>
            </span>
          </div>
          <Button variant="hero" size="sm" onClick={() => navigate("/onboarding")}>
            Let's get started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <section className="pt-28 pb-8 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            首款 AI 驱动的「声乐拆解与陪练」助手
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            让每一句歌
            <br />
            <span className="text-gradient-primary">唱得明明白白</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            不只打分，而是告诉你这句怎么唱、哪里唱错了、下一步该练什么
          </p>
        </div>
        <div className="container mx-auto max-w-3xl animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <WaveformHeroAnimation />
        </div>
        <div className="flex justify-center mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Button variant="hero" size="lg" className="text-base px-8 py-6" onClick={() => navigate("/onboarding")}>
            Let's get started
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      <section className="pt-20 pb-0 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">三步看懂、练对、练准</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">从"听不懂"到"唱得对"，再到"知道先练什么"，把每一次练习真正串起来</p>
        </div>
      </section>

      <ScrollTellingSection />

      <section className="py-20 px-4 bg-accent/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-14">为什么选择 VocalInsight？</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {advantages.map((adv, i) => (
              <motion.div key={i} className="relative group" onMouseEnter={() => setHoveredAdv(i)} onMouseLeave={() => setHoveredAdv(null)} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <div className={`rounded-2xl border bg-card p-6 h-full transition-all duration-300 ${hoveredAdv === i ? "border-primary/40 shadow-lg scale-[1.02]" : "border-border"}`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                    <adv.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">{adv.title}</h3>
                  <p className="text-xs text-primary font-semibold mb-3">{adv.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{adv.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">无论处于什么阶段，析音都是你的专属搭档</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto text-sm">点击切换，了解析音如何帮到不同阶段的你</p>
          <div className="flex justify-center gap-3 mb-10">
            {personas.map((p, i) => (
              <button key={i} onClick={() => setActivePersona(i)} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activePersona === i ? "bg-primary text-primary-foreground shadow-glow" : "bg-accent text-accent-foreground hover:bg-accent/80"}`}>
                {p.tag}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activePersona} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="max-w-2xl mx-auto">
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-5">
                  {(() => { const Icon = personas[activePersona].icon; return <Icon className="w-8 h-8 text-primary-foreground" />; })()}
                </div>
                <h3 className="text-xl font-bold mb-2">{personas[activePersona].title}</h3>
                <p className="text-muted-foreground leading-relaxed">{personas[activePersona].description}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-hero">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">准备好开始你的声乐之旅了吗？</h2>
          
          <Button variant="hero" size="lg" className="text-base px-10 py-6" onClick={() => navigate("/onboarding")}>
            Let's get started
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © 2026 VocalInsight 析音. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
