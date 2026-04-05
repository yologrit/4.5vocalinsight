import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Plus,
  Play,
  Pause,
  Maximize2,
  Bookmark,
  Share2,
  Info,
  Mic,
  Music,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
  SkipBack,
  SkipForward,
  Square,
  Repeat,
  Star,
  ThumbsUp,
  ThumbsDown,
  Mail,
  ShieldCheck,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ArrowDown,
  Check,
  Circle,
  Heart,
  Volume2,
  RotateCcw,
  Zap,
  Trophy,
  Sword,
  Wind,
  Lock,
  PlayCircle,
  Clock,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockAnalysisData, AnalysisLyricLine, AnalysisTechnique } from "@/components/vocal-analysis/types";
import { toast } from "sonner";

const techniqueColors: Record<string, string> = {
  vibrato: "bg-info/15 text-info border-info/30",
  chest: "bg-success/15 text-success border-success/30",
  falsetto: "bg-warning/15 text-warning border-warning/30",
  mixed: "bg-primary/15 text-primary border-primary/30",
  glissando: "bg-destructive/15 text-destructive border-destructive/30",
  straight: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
  breath: "bg-accent text-accent-foreground border-border",
  "falsetto-straight": "bg-gradient-to-r from-warning/15 to-muted-foreground/15 text-foreground border-border/50",
  "mixed-falsetto": "bg-gradient-to-r from-primary/15 to-warning/15 text-foreground border-border/50",
};

const getAccuracyBaseColor = (accuracy: number) => {
  if (accuracy >= 90) return "success";
  if (accuracy >= 60) return "warning";
  return "destructive";
};

const PitchVisualizer = ({ currentTime, data }: { currentTime: number, data: AnalysisLyricLine[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const timeWindow = 6; // seconds visible
      const pixelsPerSecond = width / timeWindow;
      const playheadX = width * 0.3; // Playhead at 30% from left

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw pitch lines
      data.forEach((line) => {
        const lineDuration = line.endTime - line.startTime;
        
        // Original Pitch (Gray)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        line.originalPitch.forEach((pitch, i) => {
          const timeOffset = (i / (line.originalPitch.length - 1)) * lineDuration;
          const absoluteTime = line.startTime + timeOffset;
          const x = playheadX + (absoluteTime - currentTime) * pixelsPerSecond;
          const y = height - ((pitch - 55) / 25) * height; // Map pitch 55-80 to height

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // User Pitch (Dynamic Color)
        line.userPitch.forEach((pitch, i) => {
          if (i === 0) return;
          
          const prevTimeOffset = ((i - 1) / (line.userPitch.length - 1)) * lineDuration;
          const currTimeOffset = (i / (line.userPitch.length - 1)) * lineDuration;
          
          const prevAbsTime = line.startTime + prevTimeOffset;
          const currAbsTime = line.startTime + currTimeOffset;
          
          // Only draw if within visible range or slightly beyond
          if (currAbsTime < currentTime - 2 || prevAbsTime > currentTime + 5) return;

          const x1 = playheadX + (prevAbsTime - currentTime) * pixelsPerSecond;
          const y1 = height - ((line.userPitch[i-1] - 55) / 25) * height;
          const x2 = playheadX + (currAbsTime - currentTime) * pixelsPerSecond;
          const y2 = height - ((pitch - 55) / 25) * height;

          const origPitch = line.originalPitch[i];
          const isCorrect = Math.abs(pitch - origPitch) < 2.0;
          
          ctx.beginPath();
          ctx.strokeStyle = isCorrect ? 'rgb(168, 85, 247)' : '#ef4444'; // Purple (primary) for correct
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });
      });

      // Draw Playhead
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw playhead indicator
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(playheadX, height / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    let animationFrameId: number;
    const render = () => {
      draw();
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [currentTime, data]);

  return (
    <div ref={containerRef} className="w-full h-44 bg-zinc-950 rounded-2xl border border-border relative overflow-hidden shadow-lg">
      <canvas 
        ref={canvasRef} 
        width={1200} 
        height={176} 
        className="w-full h-full"
      />
      <div className="absolute top-3 left-4 flex gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Ref Pitch</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">User Pitch</span>
        </div>
      </div>
      
      {/* Decorative scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] opacity-20" />
    </div>
  );
};

const VocalAnalysisPage = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedLine, setSelectedLine] = useState<AnalysisLyricLine | null>(mockAnalysisData[0]);
  const [selectedTechnique, setSelectedTechnique] = useState<AnalysisTechnique | null>(
    mockAnalysisData[0]?.techniques[0] || null
  );
  const [isFavorited, setIsFavorited] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  
  // Registration form states
  const [account, setAccount] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Feedback state
  const [feedback, setFeedback] = useState<Record<string, { 
    helpful: boolean; 
    notRight: boolean; 
    subOption?: string; 
    helpfulCount: number;
    correctionText?: string;
    isSubmitted?: boolean;
  }>>({
    "真声": { helpful: false, notRight: false, helpfulCount: 128 },
    "滑音": { helpful: false, notRight: false, helpfulCount: 45 },
    "混声": { helpful: false, notRight: false, helpfulCount: 256 },
    "颤音": { helpful: false, notRight: false, helpfulCount: 89 },
    "假声 → 直音": { helpful: false, notRight: false, helpfulCount: 34 },
    "混声 → 假声": { helpful: false, notRight: false, helpfulCount: 56 },
  });
  const [techFavorites, setTechFavorites] = useState<Record<string, boolean>>({});
  const [practiceFavorites, setPracticeFavorites] = useState<Record<number, boolean>>({});

  const practiceRef = useRef<HTMLDivElement>(null);

  const scrollToPractice = () => {
    practiceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const togglePracticeFavorite = (id: number) => {
    if (!isRegistered) {
      setShowRegisterDialog(true);
      return;
    }
    setPracticeFavorites(prev => ({ ...prev, [id]: !prev[id] }));
    toast.success(practiceFavorites[id] ? "已取消收藏练习任务" : "已收藏练习任务");
  };

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && countdownRef.current) {
      clearTimeout(countdownRef.current);
    }
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [countdown]);

  const handleSendCode = () => {
    if (!account) {
      toast.error("请输入手机号或邮箱");
      return;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account);
    const isPhone = /^1[3-9]\d{9}$/.test(account);
    if (!isEmail && !isPhone) {
      toast.error("请输入正确的手机号或邮箱格式");
      return;
    }
    setCountdown(60);
    toast.success("验证码已发送，请注意查收");
    console.log("Mock verification code: 123456");
  };

  const handleLogin = () => {
    if (!account || !code) {
      toast.error("请填写完整信息");
      return;
    }
    if (code !== "123456") {
      toast.error("验证码不正确 (演示码: 123456)");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsRegistered(true);
      setShowRegisterDialog(false);
      setIsSubmitting(false);
      toast.success("登录成功！");
    }, 1000);
  };

  const handleFavorite = () => {
    if (!isRegistered) {
      setShowRegisterDialog(true);
      return;
    }
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? "已取消收藏" : "已收藏分析结果");
  };

  const handleTechFavorite = (techCn: string) => {
    if (!isRegistered) {
      setShowRegisterDialog(true);
      return;
    }
    setTechFavorites(prev => ({ ...prev, [techCn]: !prev[techCn] }));
    toast.success(techFavorites[techCn] ? "已取消收藏" : "已添加到收藏夹");
  };

  const handleFeedback = (techCn: string, type: 'helpful' | 'notRight') => {
    setFeedback(prev => {
      const current = prev[techCn] || { helpful: false, notRight: false, helpfulCount: 0 };
      if (type === 'helpful') {
        const newHelpful = !current.helpful;
        return {
          ...prev,
          [techCn]: {
            ...current,
            helpful: newHelpful,
            notRight: false, // Mutually exclusive
            subOption: undefined,
            helpfulCount: newHelpful ? current.helpfulCount + 1 : current.helpfulCount - 1
          }
        };
      } else {
        return {
          ...prev,
          [techCn]: {
            ...current,
            notRight: !current.notRight,
            helpful: false, // Mutually exclusive
            helpfulCount: current.helpful ? current.helpfulCount - 1 : current.helpfulCount
          }
        };
      }
    });
  };

  const handleSubOption = (techCn: string, option: string) => {
    setFeedback(prev => ({
      ...prev,
      [techCn]: {
        ...prev[techCn],
        subOption: option,
        isSubmitted: false
      }
    }));
  };

  const handleSubmitCorrection = (techCn: string) => {
    setFeedback(prev => ({
      ...prev,
      [techCn]: {
        ...prev[techCn],
        isSubmitted: true
      }
    }));
    toast.success("感谢您的反馈！我们会尽快核实并修正。");
  };
  
  const lyricContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  const duration = 36; // Total duration in seconds

  // Timer for playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sync selected line with current time
  useEffect(() => {
    const currentLineIndex = mockAnalysisData.findIndex(
      (line) => currentTime >= line.startTime && currentTime <= line.endTime
    );
    if (currentLineIndex !== -1) {
      const line = mockAnalysisData[currentLineIndex];
      setSelectedLine(line);
      
      // Auto-scroll to active line
      const lineElement = lineRefs.current[currentLineIndex];
      if (lineElement && lyricContainerRef.current) {
        const container = lyricContainerRef.current;
        const scrollTarget = lineElement.offsetTop - container.clientHeight / 2 + lineElement.clientHeight / 2;
        container.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? "已取消收藏" : "已收藏分析结果");
  };

  const handleLineSelect = (line: AnalysisLyricLine) => {
    setSelectedLine(line);
    // Default to first technique of the line if available
    setSelectedTechnique(line.techniques[0] || null);
  };

  const handleTechniqueSelect = (e: React.MouseEvent, tech: AnalysisTechnique) => {
    e.stopPropagation(); // Prevent line selection from overriding
    setSelectedTechnique(tech);
  };

  const getAccuracyColor = (accuracy: number, alpha?: number) => {
    // Interpolate between Red (30%), Orange (70%), Green (90%)
    let r, g, b;
    if (accuracy >= 90) {
      r = 34; g = 197; b = 94; // text-green-500
    } else if (accuracy >= 70) {
      const ratio = (accuracy - 70) / 20;
      r = Math.round(249 + (34 - 249) * ratio);
      g = Math.round(115 + (197 - 115) * ratio);
      b = Math.round(22 + (94 - 22) * ratio);
    } else if (accuracy >= 30) {
      const ratio = (accuracy - 30) / 40;
      r = Math.round(239 + (249 - 239) * ratio);
      g = Math.round(68 + (115 - 68) * ratio);
      b = Math.round(68 + (22 - 68) * ratio);
    } else {
      r = 239; g = 68; b = 68; // text-red-500
    }

    return alpha !== undefined ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
  };

  const getTechniqueTagClasses = (tech: AnalysisTechnique, isSelected: boolean) => {
    const accuracy = tech.accuracy;
    const baseColor = getAccuracyBaseColor(accuracy);
    
    // Special case for "也有了几分距离" (Mixed, accuracy 75) - user wants gradient
    if (tech.type === "mixed" && accuracy === 75) {
      return `bg-gradient-to-r from-green-500/20 via-orange-500/20 to-red-500/20 text-foreground border-border/50`;
    }

    // For transition types, user wants them to match lyric color (which is dynamic)
    if (tech.type.includes('-')) {
      return `border-border/50`;
    }

    return `bg-${baseColor}/15 text-${baseColor} border-${baseColor}/30`;
  };

  const renderColoredLyrics = (line: AnalysisLyricLine) => {
    const chars = [...line.lyrics];
    const charTechMap: (string | null)[] = chars.map(() => null);
    
    line.techniques.forEach((tech) => {
      if (tech.type === "breath") return;
      for (let i = tech.startIdx; i < Math.min(tech.endIdx, chars.length); i++) {
        charTechMap[i] = tech.type;
      }
    });

    return (
      <span className="inline-flex items-center flex-wrap justify-center">
        {chars.map((char, i) => {
          const techType = charTechMap[i];
          const accuracy = line.charAccuracy[i] || 0;
          
          // Opacity ONLY if techType exists, otherwise full opacity
          const opacity = techType ? (0.2 + (accuracy / 100) * 0.8) : 1.0;
          
          // Use smooth accuracy-based color for lyrics if part of a technique
          const color = techType ? getAccuracyColor(accuracy) : "inherit";
          const isUserBreathError = line.userBreathErrors?.includes(i);

          return (
            <span key={i} className="relative inline-flex items-center">
              <span className={`${techType ? 'font-medium' : ''}`} style={{ opacity, color }}>
                {char}
              </span>
              {isUserBreathError && (
                <span className="relative -top-2 text-destructive text-base font-semibold mx-0.5 select-none" title="错误换气点">ᐯ</span>
              )}
            </span>
          );
        })}
        {line.breathMark && (
          <span className="relative -top-2 ml-0.5 text-primary text-base font-semibold select-none opacity-70" title="原唱换气点">ᐯ</span>
        )}
      </span>
    );
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center px-4 gap-3 bg-background/80 backdrop-blur-md z-50 flex-shrink-0">
        <button
          onClick={() => navigate("/coach")}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h1 className="text-sm font-semibold">唱功分析详情</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant={isFavorited ? "secondary" : "ghost"} 
            size="sm"
            onClick={handleFavorite}
            className={isFavorited ? "text-yellow-500" : ""}
          >
            <Star className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} /> 收藏
          </Button>
        </div>
      </header>

      {/* Song info (Consistent with VocalNotesPage) */}
      <div className="px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-4 max-w-5xl mx-auto">
          <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <Music className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">起风了 (我的练唱)</h2>
            <p className="text-sm text-muted-foreground">对比参考：买辣椒也用券 · 唱功分析</p>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="ml-auto p-3 rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-glow"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory">
        {/* Analysis Section (Original Content) */}
        <div className="h-full flex flex-col md:flex-row overflow-hidden relative snap-start shrink-0">
          {/* Left Panel: Lyrics & Pitch Visualizer */}
          <div className="flex-1 flex flex-col border-r border-border overflow-hidden bg-background relative h-full">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            {/* Lyrics Scroll Area */}
            <div 
              ref={lyricContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth no-scrollbar"
            >
              <div className="max-w-2xl mx-auto py-32 space-y-12">
                {mockAnalysisData.map((line, idx) => {
                  const isActive = selectedLine === line;
                  return (
                    <div
                      key={idx}
                      ref={el => lineRefs.current[idx] = el}
                      onClick={() => handleLineSelect(line)}
                      className={`w-full text-center transition-all duration-500 cursor-pointer ${
                        isActive
                          ? "scale-110 opacity-100"
                          : "scale-95 opacity-30 hover:opacity-50"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        {/* Technique tags row */}
                        <div className={`relative flex items-end min-h-[28px] mb-6 w-full justify-center transition-all duration-500 ${isActive ? 'translate-y-0' : 'translate-y-2 opacity-0'}`}>
                          <div className="relative" style={{ width: `${line.lyrics.length * 1.05}em` }}>
                            {(() => {
                              const sortedTechs = [...line.techniques].sort((a, b) => a.startIdx - b.startIdx);
                              return sortedTechs.map((tech, tIdx) => {
                                const offsetEm = tech.startIdx * 1.05;
                                const isSelected = selectedTechnique === tech;
                                const isTransition = tech.type.includes('-');
                                const dynamicColor = isTransition ? getAccuracyColor(tech.accuracy) : undefined;
                                const dynamicBg = isTransition ? getAccuracyColor(tech.accuracy, 0.15) : undefined;
                                const dynamicBorder = isTransition ? getAccuracyColor(tech.accuracy, 0.3) : undefined;
                                
                                return (
                                  <button
                                    key={tIdx}
                                    onClick={(e) => handleTechniqueSelect(e, tech)}
                                    className={`absolute inline-flex items-center px-1.5 py-0 rounded text-[10px] font-semibold border transition-all ${
                                      isSelected 
                                        ? "opacity-100 z-10" 
                                        : "opacity-80 hover:opacity-100"
                                    } ${getTechniqueTagClasses(tech, isSelected)}`}
                                    style={{ 
                                      left: `${offsetEm}em`,
                                      backgroundColor: dynamicBg,
                                      color: dynamicColor,
                                      borderColor: dynamicBorder
                                    }}
                                  >
                                    {tech.cn}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>

                        {/* Lyrics row */}
                        <div className="flex items-baseline gap-0 justify-center">
                          <p
                            className={`leading-relaxed tracking-widest transition-all duration-500 ${
                              isActive ? "text-2xl font-black text-foreground" : "text-xl font-medium text-muted-foreground"
                            }`}
                          >
                            {renderColoredLyrics(line)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pitch Visualizer Area */}
            <div className="px-6 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent flex-shrink-0">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase tracking-tighter">
                      Pitch Analysis
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">Real-time Feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Accuracy</span>
                    <span className="text-xs font-bold text-success">92%</span>
                  </div>
                </div>
                <PitchVisualizer currentTime={currentTime} data={mockAnalysisData} />
              </div>
            </div>

            {/* Playback Control Bar (Unified with Page Style) */}
            <div className="h-24 border-t border-border bg-card flex flex-col justify-center px-8 flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
              <div className="max-w-5xl mx-auto w-full space-y-3">
                {/* Progress Slider */}
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-muted-foreground w-10">{formatTime(currentTime)}</span>
                  <div className="flex-1 h-1.5 bg-accent rounded-full relative overflow-hidden cursor-pointer">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-primary transition-all duration-100" 
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground w-10">{formatTime(duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button className="text-muted-foreground hover:text-foreground transition-colors"><SkipBack className="w-4 h-4" /></button>
                    <button className="text-muted-foreground hover:text-foreground transition-colors"><SkipForward className="w-4 h-4" /></button>
                    <button className="text-muted-foreground hover:text-foreground transition-colors"><Repeat className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-center gap-8">
                    <button className="text-muted-foreground hover:text-foreground transition-colors"><SkipBack className="w-5 h-5 fill-current" /></button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-glow"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                    </button>
                    <button 
                      onClick={() => { setIsPlaying(false); setCurrentTime(0); }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Square className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="text-muted-foreground hover:text-foreground transition-colors"><Maximize2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll Down Hint - Relocated to avoid blocking pitch analysis */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-32 right-8 flex flex-col items-end gap-2 cursor-pointer z-20 group"
              onClick={scrollToPractice}
            >
              <motion.div 
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex flex-col items-end gap-2"
              >
                <div className="px-4 py-2 rounded-2xl bg-primary/20 border border-primary/40 backdrop-blur-xl shadow-glow-sm group-hover:bg-primary/30 transition-all flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">Next Phase</span>
                    <span className="text-[11px] font-bold text-primary-foreground whitespace-nowrap">解锁下一步练习建议</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Panel: Diagnostic Card (Remains mostly same as Figure 2) */}
          <div className="w-full md:w-[400px] bg-card overflow-y-auto border-l border-border h-full">
            {selectedTechnique?.analysis ? (
              <div className="p-6 space-y-8">
                {/* Conclusion & Score */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold tracking-tight">诊断结论</h3>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {selectedTechnique.cn}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className={`w-4 h-4 rounded-sm rotate-45 ${
                            star <= (selectedLine?.overallScore || 0) ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm leading-relaxed">
                    {selectedTechnique.analysis.conclusion}
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">核心指标</h4>
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">音高贴合</span>
                        <span className="font-mono font-medium">{selectedTechnique.analysis.metrics.pitchFit}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={selectedTechnique.analysis.metrics.pitchFit} className="h-1.5" />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">尾音略往下滑</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">换声平滑度</span>
                        <span className="font-mono font-medium">{selectedTechnique.analysis.metrics.breathSmoothness}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={selectedTechnique.analysis.metrics.breathSmoothness} className="h-1.5" />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">进入高音时过于直推</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">长音稳定性</span>
                        <span className="font-mono font-medium">{selectedTechnique.analysis.metrics.longNoteStability}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={selectedTechnique.analysis.metrics.longNoteStability} className="h-1.5" />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">后半段支撑变弱</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">目标技巧达成情况</span>
                        <span className="font-mono font-medium">{selectedTechnique.analysis.metrics.techniqueAchievementScore}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={selectedTechnique.analysis.metrics.techniqueAchievementScore} className="h-1.5" />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {selectedTechnique.analysis.metrics.techniqueAchievementScore >= 90 ? "表现出色" : 
                           selectedTechnique.analysis.metrics.techniqueAchievementScore >= 70 ? "基本达成" : "仍需练习"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis (Category-based) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      目标技巧达成情况解释
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {/* Visual Representation */}
                    <div className="space-y-4">
                      {selectedTechnique.analysis.details.visualType === "mode" && (
                        <div className="space-y-4">
                          {!selectedTechnique.analysis.details.data.hideComparison && (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-accent/30 border border-border space-y-2">
                                <p className="text-base font-bold">原唱</p>
                                <p className="text-sm font-medium text-muted-foreground">{selectedTechnique.analysis.details.data.originalMode}</p>
                                <Badge variant="secondary" className="text-[10px] px-1.5 h-4 bg-muted/50">
                                  判断较明确
                                </Badge>
                              </div>
                              <div className="p-4 rounded-xl bg-accent/30 border border-border space-y-2">
                                <p className="text-base font-bold">你</p>
                                <p className="text-sm font-medium text-muted-foreground">{selectedTechnique.analysis.details.data.userMode}</p>
                                <Badge variant="secondary" className="text-[10px] px-1.5 h-4 bg-muted/50">
                                  有一定混合倾向
                                </Badge>
                              </div>
                            </div>
                          )}

                          {selectedTechnique.analysis.details.data.transitionState && (
                            <div className="p-4 rounded-xl bg-accent/30 border border-border space-y-4">
                              <p className="text-[10px] text-muted-foreground uppercase">过渡状态</p>
                              <div className="flex items-center gap-2">
                                <div className="px-3 py-1 rounded-full bg-muted/50 text-[10px] text-muted-foreground font-medium">
                                  {selectedTechnique.analysis.details.data.fromLabel || "真声"}
                                </div>
                                <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                                <div className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/30 text-[10px] font-bold">
                                  {selectedTechnique.analysis.details.data.transitionState}
                                </div>
                                <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                                <div className="px-3 py-1 rounded-full bg-muted/50 text-[10px] text-muted-foreground font-medium">
                                  {selectedTechnique.analysis.details.data.toLabel || (selectedTechnique.type === "mixed-falsetto" ? "假声" : "混声")}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {(() => {
                                  const advice = selectedTechnique.analysis.details.data.advice || "换声衔接处可以更加平滑。";
                                  const sentences = advice.split(/[。！？]/).filter(s => s.trim().length > 0);
                                  return sentences.length > 1 ? sentences[sentences.length - 1] + "。" : advice;
                                })()}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedTechnique.analysis.details.visualType === "stability" && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-accent/30 border border-border flex items-center gap-4">
                            <div className="flex-shrink-0 space-y-1 w-16">
                              <p className="text-base font-bold">原唱</p>
                              <p className="text-[10px] text-muted-foreground">稳定度：高</p>
                            </div>
                            <div className="flex-1 h-12 flex items-center justify-center bg-background/50 rounded-lg overflow-hidden">
                              <svg viewBox="0 0 100 20" className="w-full h-8 stroke-muted-foreground/40 fill-none">
                                <path d="M0 10 Q 12.5 5, 25 10 T 50 10 T 75 10 T 100 10" strokeWidth="1.5" />
                              </svg>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-accent/30 border border-border flex items-center gap-4">
                            <div className="flex-shrink-0 space-y-1 w-16">
                              <p className="text-base font-bold">你</p>
                              <p className="text-[10px] text-muted-foreground">稳定度：中</p>
                            </div>
                            <div className="flex-1 h-12 flex items-center justify-center bg-background/50 rounded-lg overflow-hidden">
                              <svg viewBox="0 0 100 20" className="w-full h-8 stroke-primary fill-none">
                                <path d="M0 10 Q 12.5 12, 25 10 T 50 13 T 75 16 T 100 18" strokeWidth="1.5" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedTechnique.analysis.details.visualType === "trajectory" && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-accent/30 border border-border flex items-center gap-4">
                            <div className="flex-shrink-0 space-y-1 w-16">
                              <p className="text-base font-bold">原唱</p>
                              <p className="text-[10px] text-muted-foreground">平滑上滑</p>
                            </div>
                            <div className="flex-1 h-16 flex items-center justify-center bg-background/50 rounded-lg overflow-hidden relative">
                              <svg viewBox="0 0 100 40" className="w-full h-12 stroke-primary fill-none">
                                <path d="M20 30 Q 40 28, 60 15 T 90 10" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-accent/30 border border-border flex items-center gap-4">
                            <div className="flex-shrink-0 space-y-1 w-16">
                              <p className="text-base font-bold">你</p>
                              <p className="text-[10px] text-muted-foreground">直接到位</p>
                            </div>
                            <div className="flex-1 h-16 flex items-center justify-center bg-background/50 rounded-lg overflow-hidden relative">
                              <svg viewBox="0 0 100 40" className="w-full h-12 stroke-primary/60 fill-none">
                                <path d="M20 30 L 90 10" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Summary List */}
                    <ul className="space-y-2">
                      {selectedTechnique.analysis.details.summary.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Advice Text */}
                    {selectedTechnique.analysis.details.data.advice && (
                      <p className="text-sm text-foreground/80 leading-relaxed pt-2">
                        {selectedTechnique.analysis.details.data.advice}
                      </p>
                    )}

                    {/* Feedback Micro-interactions */}
                    <div className="pt-6 border-t border-border mt-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleFeedback(selectedTechnique.cn, 'helpful')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            feedback[selectedTechnique.cn]?.helpful
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-accent/50 text-muted-foreground hover:bg-accent border border-transparent"
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${feedback[selectedTechnique.cn]?.helpful ? "fill-current" : ""}`} />
                          有帮助 {feedback[selectedTechnique.cn]?.helpfulCount || 0}
                        </button>
                        <button
                          onClick={() => handleFeedback(selectedTechnique.cn, 'notRight')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            feedback[selectedTechnique.cn]?.notRight
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-accent/50 text-muted-foreground hover:bg-accent border border-transparent"
                          }`}
                        >
                          <ThumbsDown className={`w-3.5 h-3.5 ${feedback[selectedTechnique.cn]?.notRight ? "fill-current" : ""}`} />
                          不太对
                        </button>
                        <button
                          onClick={() => handleTechFavorite(selectedTechnique.cn)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ml-auto ${
                            techFavorites[selectedTechnique.cn]
                              ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                              : "bg-accent/50 text-muted-foreground hover:bg-accent border border-transparent"
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${techFavorites[selectedTechnique.cn] ? "fill-current" : ""}`} />
                          收藏
                        </button>
                      </div>

                      {/* Sub-options for "Not quite right" */}
                      <AnimatePresence>
                        {feedback[selectedTechnique.cn]?.notRight && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-3"
                          >
                            <div className="p-3 rounded-xl bg-accent/30 border border-border grid grid-cols-2 gap-2">
                              {["音高判断不对", "节奏判断不对", "技巧判断不对", "评价太严苛"].map((option) => (
                                <button
                                  key={option}
                                  onClick={() => handleSubOption(selectedTechnique.cn, option)}
                                  className={`text-[10px] py-1.5 px-2 rounded-lg text-left transition-all ${
                                    feedback[selectedTechnique.cn]?.subOption === option
                                      ? "bg-primary text-primary-foreground shadow-sm"
                                      : "bg-background/50 text-muted-foreground hover:bg-background"
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>

                            {feedback[selectedTechnique.cn]?.subOption && !feedback[selectedTechnique.cn]?.isSubmitted && (
                              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-[10px] text-muted-foreground px-1 font-medium">请提供正确的描述或建议（可选）：</p>
                                <textarea
                                  value={feedback[selectedTechnique.cn]?.correctionText || ""}
                                  onChange={(e) => setFeedback(prev => ({
                                    ...prev,
                                    [selectedTechnique.cn]: {
                                      ...prev[selectedTechnique.cn],
                                      correctionText: e.target.value
                                    }
                                  }))}
                                  placeholder="例如：这里应该是混声而不是假声..."
                                  className="w-full h-20 bg-background border border-border rounded-lg p-2 text-xs outline-none focus:border-primary/30 resize-none"
                                />
                                <button
                                  onClick={() => handleSubmitCorrection(selectedTechnique.cn)}
                                  className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
                                >
                                  提交勘误
                                </button>
                              </div>
                            )}

                            {feedback[selectedTechnique.cn]?.isSubmitted && (
                              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] text-center animate-in fade-in duration-500">
                                感谢您的反馈！我们会尽快核实并修正。
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">选择声乐技巧查看详情</p>
                  <p className="text-xs text-muted-foreground mt-1">点击歌词上方的标签，查看该技巧的详细唱功诊断</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Practice Suggestions Section - Gamified & Optimized */}
        <div ref={practiceRef} className="h-full bg-[#0a0a0c] p-6 space-y-8 snap-start shrink-0 overflow-y-auto relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          
          {/* Visual Bridge Header */}
          <div className="max-w-5xl mx-auto pt-4 pb-2 relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-primary/60" />
                  <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                  <Badge variant="outline" className="bg-primary/20 text-primary-foreground border-primary/50 text-xs uppercase tracking-[0.4em] px-8 py-2 rounded-full font-black shadow-glow-sm">
                    LEVEL UP PHASE
                  </Badge>
                  <div className="w-8 h-px bg-primary/60" />
                </div>
                <span className="text-xs font-black text-zinc-200 uppercase tracking-widest">开启针对性进阶训练 · 突破自我极限</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-primary/50 to-transparent" />
            </div>
          </div>

          <div className="max-w-5xl mx-auto space-y-10 relative z-10">
            {/* Gamified Roadmap & Suggestion */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Main Suggestion (Gamified Card) */}
              <div className="lg:col-span-7 p-6 rounded-[2.5rem] bg-zinc-900/80 border border-zinc-700/60 shadow-2xl relative overflow-hidden group backdrop-blur-md">
                {/* Animated Background Gradients */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-primary/30 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-[80px]" />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-glow relative">
                        <Zap className="w-7 h-7 text-white" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                          <span className="text-[8px] font-black text-zinc-900">!</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black tracking-tight text-white italic">当前主线任务</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] font-black px-2 py-0">URGENT</Badge>
                          <p className="text-xs text-zinc-200 font-bold uppercase tracking-widest">Priority: Critical</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-white/5 border border-zinc-600/50 flex items-center gap-2 backdrop-blur-md">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                      <span className="text-xs font-black text-white uppercase tracking-widest">进行中</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-5">
                    <div className="p-6 rounded-[2rem] bg-white/5 border border-zinc-700/50 backdrop-blur-sm relative overflow-hidden group/diag">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em]">
                            <Info className="w-3.5 h-3.5" />
                            System Diagnosis
                          </div>
                          <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">AI Analysis</Badge>
                        </div>
                        <p className="text-2xl font-black leading-tight text-white tracking-tight">
                          你的<span className="text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20 mx-1">气息支撑</span>尚不稳定
                        </p>
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-zinc-100 leading-relaxed">
                            建议先从<span className="text-white font-bold underline decoration-primary/50 underline-offset-4">副歌第一句</span>开始，通过慢速长音练习来稳固根基。
                          </p>
                          <div className="flex items-center gap-2 text-xs text-zinc-300 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            <span>解锁条件：气息稳定性达到 85%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div className="p-5 rounded-[1.5rem] bg-white/5 border border-zinc-700/40 flex flex-col justify-between hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-black text-zinc-200 uppercase tracking-widest">阶段进度</span>
                          <span className="text-base font-black text-primary">35%</span>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-zinc-700/40">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "35%" }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                            />
                          </div>
                          <p className="text-[10px] text-zinc-300 font-bold text-right">距离下一等级还差 1250 XP</p>
                        </div>
                      </div>
                      <div className="p-5 rounded-[1.5rem] bg-white/5 border border-zinc-700/40 flex flex-col justify-between hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-black text-zinc-200 uppercase tracking-widest">任务奖励</span>
                          <div className="flex gap-1">
                            <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/40">
                              <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                            </div>
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                              <Zap className="w-2.5 h-2.5 text-primary fill-current" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-9 h-9 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center overflow-hidden shadow-lg">
                                <img src={`https://picsum.photos/seed/user${i}/36/36`} alt="user" className="w-full h-full object-cover opacity-90" />
                              </div>
                            ))}
                            <div className="w-9 h-9 rounded-full border-2 border-zinc-900 bg-primary/30 flex items-center justify-center text-xs font-black text-primary shadow-lg backdrop-blur-sm">
                              +12
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-white">15 人</p>
                            <p className="text-[10px] font-bold text-zinc-300">正在挑战</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Skill Tree (Roadmap) */}
              <div className="lg:col-span-5 p-6 rounded-[2.5rem] bg-zinc-900/50 border border-zinc-700/60 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)]" />
                
                <div className="relative z-10 w-full space-y-8">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-px w-8 bg-zinc-600" />
                    <h4 className="text-sm font-black text-zinc-100 uppercase tracking-[0.3em]">技能进阶路径</h4>
                    <div className="h-px w-8 bg-zinc-600" />
                  </div>
                  
                  <div className="flex flex-col items-center space-y-10">
                    {[
                      { label: "气息稳定", status: "current", icon: Wind, desc: "基础根基", lv: "Lv.01" },
                      { label: "换声区突破", status: "locked", icon: Repeat, desc: "假音转直音", lv: "Lv.05" },
                      { label: "混声进阶", status: "locked", icon: Layers, desc: "终极挑战", lv: "Lv.10" },
                    ].map((step, i, arr) => (
                      <div key={i} className="relative flex flex-col items-center group/step w-full max-w-[220px]">
                        {/* Vertical Connection Line */}
                        {i < arr.length - 1 && (
                          <div className={`absolute top-16 w-0.5 h-10 ${step.status === 'completed' ? 'bg-primary' : 'bg-zinc-700'} transition-colors duration-500`} />
                        )}
                        
                        <div className="flex items-center gap-4 w-full">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 transition-all duration-500 relative ${
                              step.status === 'completed' ? 'bg-primary text-primary-foreground shadow-[0_0_30px_rgba(168,85,247,0.5)]' :
                              step.status === 'current' ? 'bg-zinc-800 border-2 border-primary text-primary shadow-[0_0_25px_rgba(168,85,247,0.3)]' :
                              'bg-zinc-800 text-zinc-400 border border-zinc-600'
                            }`}
                          >
                            <step.icon className={`w-8 h-8 ${step.status === 'current' ? 'animate-pulse' : ''}`} />
                            
                            {/* Status Indicator */}
                            {step.status === 'locked' && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-600 flex items-center justify-center shadow-lg">
                                <Lock className="w-3 h-3 text-zinc-400" />
                              </div>
                            )}
                          </motion.div>
                          
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className={`text-base font-black transition-colors duration-500 ${
                                step.status === 'locked' ? 'text-zinc-400' : 'text-white'
                              }`}>
                                {step.label}
                              </span>
                              <span className={`text-xs font-black ${step.status === 'locked' ? 'text-zinc-500' : 'text-primary'}`}>{step.lv}</span>
                            </div>
                            <span className="text-xs text-zinc-200 font-bold uppercase tracking-widest block mt-0.5">{step.desc}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Practice Action Area - Gamified Task Cards */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Sword className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-widest">每日挑战任务</h4>
                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Daily Quests · 完成任务获取大量经验</p>
                  </div>
                </div>
                 <div className="px-4 py-2 rounded-xl bg-white/5 border border-zinc-600/50 flex items-center gap-2 text-xs font-black text-zinc-200">
                   <Clock className="w-3.5 h-3.5 text-primary" />
                   <span>23:54:12 后刷新</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    id: 1,
                    title: "气息稳固：长音支撑挑战",
                    goal: "稳定性 +15%",
                    method: "深吸气，保持腹部支撑，练习“啊”音平稳延长10秒",
                    difficulty: 2,
                    xp: 250,
                    icon: Wind,
                    color: "from-blue-500/20 to-primary/20"
                  },
                  {
                    id: 2,
                    title: "换声预演：弱声滑音练习",
                    goal: "平滑度 +10%",
                    method: "用极小的音量，从低音平滑滑向高音，感受声带闭合",
                    difficulty: 4,
                    xp: 500,
                    icon: Repeat,
                    locked: true,
                    color: "from-purple-500/20 to-pink-500/20"
                  }
                ].map((task) => (
                  <motion.div 
                    key={task.id}
                    whileHover={{ y: -8, scale: 1.01 }}
                    className={`p-6 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group backdrop-blur-md ${
                      task.locked 
                        ? 'bg-zinc-900/30 border-zinc-700/30 opacity-60 grayscale' 
                        : 'bg-zinc-900/60 border-zinc-700/50 hover:border-primary/40 hover:bg-zinc-900/80 shadow-2xl'
                    }`}
                  >
                    {/* Task Background Gradient */}
                    {!task.locked && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${task.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                    )}
                    
                    {/* Task Background Pattern */}
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 group-hover:rotate-12 group-hover:scale-110">
                      <task.icon className="w-full h-full" />
                    </div>

                    <div className="relative z-10 space-y-8">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-black border-primary/30 text-primary bg-primary/5 px-2 py-0">
                              TASK 0{task.id}
                            </Badge>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 5].map(star => (
                                <div key={star} className={`w-2 h-2 rounded-full ${star <= task.difficulty ? 'bg-yellow-500' : 'bg-zinc-700'}`} />
                              ))}
                            </div>
                          </div>
                          <h5 className="font-black text-xl text-white tracking-tight">{task.title}</h5>
                        </div>
                        <button 
                          onClick={() => !task.locked && togglePracticeFavorite(task.id)}
                          className={`p-3 rounded-2xl transition-all ${
                            practiceFavorites[task.id] ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${practiceFavorites[task.id] ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-zinc-700/40">
                          <p className="text-[10px] font-black text-zinc-200 uppercase tracking-widest mb-1">奖励</p>
                          <p className="text-base font-bold text-primary">+{task.xp} XP</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-zinc-700/40">
                          <p className="text-[10px] font-black text-zinc-200 uppercase tracking-widest mb-1">属性提升</p>
                          <p className="text-base font-bold text-success">{task.goal}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs font-black text-zinc-200 uppercase tracking-widest">任务说明</p>
                        <p className="text-sm text-zinc-100 leading-relaxed font-medium">{task.method}</p>
                      </div>

                      <div className="pt-4 flex items-center gap-3">
                        {task.locked ? (
                          <Button disabled className="w-full rounded-2xl h-12 bg-zinc-800/50 text-zinc-400 gap-2 font-bold border border-zinc-700/40">
                            <Lock className="w-4 h-4" /> 尚未解锁
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" className="flex-1 rounded-2xl h-12 border-zinc-600/60 text-white bg-white/5 hover:bg-white/10 font-bold gap-2">
                              <PlayCircle className="w-4 h-4" /> 听参考
                            </Button>
                            <Button className="flex-1 rounded-2xl h-12 bg-gradient-to-r from-primary to-purple-600 text-white font-bold gap-2 shadow-glow hover:scale-[1.02] transition-transform">
                              <Mic className="w-4 h-4" /> 开始挑战
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-primary p-6 text-primary-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" />
                欢迎加入 VocalInsight
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/80">
                登录后即可永久保存您的分析结果和收藏记录
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 space-y-5 bg-card">
            <div className="space-y-2">
              <Label htmlFor="account" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> 手机号 / 邮箱
              </Label>
              <Input 
                id="account" 
                placeholder="请输入手机号或邮箱" 
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="h-11 bg-accent/50 border-transparent focus:border-primary/30 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> 验证码
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="code" 
                  placeholder="6位验证码" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-11 bg-accent/50 border-transparent focus:border-primary/30 transition-all"
                />
                <Button 
                  variant="outline" 
                  className="h-11 px-4 min-w-[100px] font-medium border-primary/20 text-primary hover:bg-primary/5"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `${countdown}s` : "获取验证码"}
                </Button>
              </div>
            </div>

            <Button 
              className="w-full h-12 bg-gradient-primary text-primary-foreground font-bold text-base shadow-glow hover:opacity-90 transition-all"
              onClick={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? "正在登录..." : "立即登录 / 注册"}
            </Button>
            
            <p className="text-[10px] text-center text-muted-foreground px-4 leading-relaxed">
              登录即代表您同意 <span className="text-primary cursor-pointer hover:underline">用户协议</span> 和 <span className="text-primary cursor-pointer hover:underline">隐私政策</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VocalAnalysisPage;
