import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Play, Star, Music,
  BookOpen, ChevronDown, Pause, Mail, Phone, ShieldCheck,
  BarChart3, Check, Circle, CheckCircle2, Edit3, StickyNote, Plus, Trash2, X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { mockLyrics, techniqueDetails } from "@/components/vocal-notes/types";
import LyricLineItem from "@/components/vocal-notes/LyricLineItem";
import AnnotationPanel from "@/components/vocal-notes/AnnotationPanel";
import { toast } from "sonner";

const VocalNotesPage = () => {
  const navigate = useNavigate();
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [hoveredTechnique, setHoveredTechnique] = useState<string | null>(null);
  const [pinnedTechnique, setPinnedTechnique] = useState<string | null>(null);
  const [hoveredBreath, setHoveredBreath] = useState(false);
  const [pinnedBreath, setPinnedBreath] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayLine, setCurrentPlayLine] = useState(-1);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(false);
  const [selectedForAnalysis, setSelectedForAnalysis] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [activeTool, setActiveTool] = useState<"text" | "circle">("text");
  const [activeColor, setActiveColor] = useState<string>("text-blue-600/80");
  const [annotations, setAnnotations] = useState<{ 
    id: string; 
    type: "text" | "circle" | "highlight";
    text?: string; 
    color: string; 
    x: number; 
    y: number; 
    rotation: number;
    width?: number;
    height?: number;
  }[]>([]);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentNoteText, setCurrentNoteText] = useState("");
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);

  const annotationColors = {
    text: "text-primary/80",
    circle: "stroke-primary/40",
    highlight: "fill-primary/20"
  };

  const availableColors = [
    { name: "墨蓝", value: "text-blue-600/80", bg: "bg-blue-600/80", border: "border-blue-600/20" },
    { name: "朱红", value: "text-red-500/80", bg: "bg-red-500/80", border: "border-red-500/20" },
    { name: "明黄", value: "text-yellow-500/80", bg: "bg-yellow-500/80", border: "border-yellow-500/20" },
    { name: "草绿", value: "text-green-500/80", bg: "bg-green-500/80", border: "border-green-500/20" },
  ];

  const getShapeColor = (colorValue: string, type: string) => {
    if (type === "highlight") {
      return colorValue.replace("text-", "bg-").replace("/80", "/50");
    }
    return colorValue;
  };
  
  // Registration form states
  const [account, setAccount] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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
    // Simple validation for email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account);
    const isPhone = /^1[3-9]\d{9}$/.test(account);
    
    if (!isEmail && !isPhone) {
      toast.error("请输入正确的手机号或邮箱格式");
      return;
    }

    setCountdown(60);
    toast.success("验证码已发送，请注意查收");
    // Mock code for demo
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
    // Simulate API call
    setTimeout(() => {
      setIsRegistered(true);
      setShowRegisterDialog(false);
      setIsSubmitting(false);
      toast.success("登录成功！");
      // If they were trying to favorite, do it now
      setIsFavorited(true);
      toast.success("已添加到收藏夹");
    }, 1000);
  };

  const handleFavorite = () => {
    if (!isRegistered) {
      setShowRegisterDialog(true);
      return;
    }
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? "已取消收藏" : "已添加到收藏夹");
  };

  const handleLineClick = (index: number) => {
    setSelectedLine(index);
  };

  const handlePlay = () => {
    if (isPlaying) {
      // Pause: stop interval but keep currentPlayLine (stays bold)
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    const startLine = currentPlayLine >= 0 ? currentPlayLine : 0;
    setCurrentPlayLine(startLine);
    let line = startLine;
    intervalRef.current = setInterval(() => {
      line++;
      if (line >= mockLyrics.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsPlaying(false);
        setCurrentPlayLine(-1);
      } else {
        setCurrentPlayLine(line);
      }
    }, 2000);
  };

  const handleTechniqueHover = useCallback((type: string | null) => {
    setHoveredTechnique(type);
  }, []);

  const handleTechniquePin = useCallback((type: string | null) => {
    setPinnedTechnique((prev) => (prev === type ? null : type));
    setPinnedBreath(false);
  }, []);

  const handleBreathHover = useCallback((hover: boolean) => {
    setHoveredBreath(hover);
  }, []);

  const handleBreathPin = useCallback(() => {
    setPinnedBreath((prev) => !prev);
    setPinnedTechnique(null);
  }, []);

  // Continuous selection logic for analysis mode
  const handleAnalysisSelect = (index: number) => {
    setSelectedForAnalysis(prev => {
      if (prev.includes(index)) {
        // Deselecting: only allow if it doesn't break continuity
        const remaining = prev.filter(x => x !== index);
        if (remaining.length === 0) return remaining;
        const sorted = [...remaining].sort((a, b) => a - b);
        // Check continuity
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i] - sorted[i - 1] !== 1) {
            toast.info("为了分析准确，请保持选择的乐句连续");
            return prev; // would break continuity
          }
        }
        return remaining;
      } else {
        // Adding: must be adjacent to existing selection
        if (prev.length === 0) return [index];
        const sorted = [...prev].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        if (index === min - 1 || index === max + 1) {
          return [...prev, index];
        }
        // If not adjacent, show hint
        if (index < min - 1 || index > max + 1) {
          toast.info("请选择与当前选中项相邻的乐句，保持分析连续性");
          return prev;
        }
        return prev;
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedForAnalysis.length === mockLyrics.length) {
      setSelectedForAnalysis([]);
    } else {
      setSelectedForAnalysis(mockLyrics.map((_, i) => i));
    }
  };

  const handleLyricsClick = (e: React.MouseEvent) => {
    if (!editMode || !lyricsContainerRef.current) return;
    
    // If clicking a button or existing annotation, don't add a new one
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.annotation-item')) return;

    const container = lyricsContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate coordinates relative to the scrollable content
    // We want the annotation to be centered on the click
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top + container.scrollTop) / container.scrollHeight) * 100;

    if (activeTool === "text") {
      setPendingCoords({ x, y });
      setCurrentNoteText("");
      setNoteDialogOpen(true);
    } else {
      // Add shape directly
      const newAnnotation = {
        id: Math.random().toString(36).substr(2, 9),
        type: activeTool,
        color: getShapeColor(activeColor, activeTool),
        x: x - (activeTool === "circle" ? 4 : 6), // Offset to center horizontally (~80px/120px width)
        y: y - (activeTool === "circle" ? 2 : 1.5), // Offset to center vertically
        rotation: Math.floor(Math.random() * 10) - 5,
        width: activeTool === "circle" ? 80 : 120,
        height: activeTool === "circle" ? 40 : 24,
      };
      setAnnotations([...annotations, newAnnotation]);
    }
  };

  const saveNote = () => {
    if (!currentNoteText.trim() || !pendingCoords) return;
    const newAnnotation = {
      id: Math.random().toString(36).substr(2, 9),
      type: "text" as const,
      text: currentNoteText,
      color: activeColor,
      x: pendingCoords.x - 2, // Slight offset to center text better
      y: pendingCoords.y - 1,
      rotation: Math.floor(Math.random() * 4) - 2,
    };
    setAnnotations([...annotations, newAnnotation]);
    setNoteDialogOpen(false);
    setCurrentNoteText("");
    setPendingCoords(null);
  };

  const handleAnnotationDragStart = (e: React.DragEvent, anno: { id: string; x: number; y: number }) => {
    if (!editMode) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleAnnotationDragEnd = (id: string, e: React.DragEvent) => {
    if (!editMode || !lyricsContainerRef.current || !dragOffset) return;
    
    // Some browsers return 0,0 on drag end if cancelled or just weirdly
    if (e.clientX === 0 && e.clientY === 0) return;

    const container = lyricsContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate new position accounting for the grab offset
    const x = ((e.clientX - dragOffset.x - rect.left) / rect.width) * 100;
    const y = ((e.clientY - dragOffset.y - rect.top + container.scrollTop) / container.scrollHeight) * 100;

    setAnnotations(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    setDragOffset(null);
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(n => n.id !== id));
  };

  const clearAllAnnotations = () => {
    setAnnotations([]);
    toast.success("已清除所有笔记");
  };


  const showBreathInfo = pinnedBreath || (!pinnedTechnique && !hoveredTechnique && hoveredBreath);
  const getActiveTech = () => {
    if (showBreathInfo) return null;
    if (hoveredTechnique) return hoveredTechnique;
    if (pinnedTechnique) return pinnedTechnique;
    
    if (selectedLine !== null) {
      const line = mockLyrics[selectedLine];
      if (line && line.techniques.length > 0) {
        // Check for transition (adjacent techniques)
        if (line.techniques.length >= 2) {
          const t1 = line.techniques[0];
          const t2 = line.techniques[1];
          // If they are adjacent (end of one is start of next, or with 1 char overlap/gap)
          if (Math.abs(t1.endIdx - t2.startIdx) <= 1) {
            const transitionKey = `${t1.type}-${t2.type}`;
            if (techniqueDetails[transitionKey]) {
              return transitionKey;
            }
          }
        }
        return line.techniques[0].type;
      }
    }
    return null;
  };

  const activeTech = getActiveTech();

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <div className="h-14 border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
        <button onClick={() => navigate("/coach")} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h1 className="text-sm font-semibold">声乐笔记 Vocal Notes</h1>
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
      </div>

      {/* Song info */}
      <div className="px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <Music className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">起风了</h2>
            <p className="text-sm text-muted-foreground">买辣椒也用券 · 声乐笔记</p>
          </div>
          <button
            onClick={handlePlay}
            className="ml-auto p-3 rounded-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-glow"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Lyrics panel */}
        <div 
          ref={lyricsContainerRef}
          onClick={handleLyricsClick}
          onDragOver={(e) => e.preventDefault()}
          className={`flex-1 overflow-y-auto px-6 py-6 relative ${editMode ? "cursor-crosshair bg-accent/5 transition-colors" : ""}`}
        >
          <div className={`max-w-2xl mx-auto space-y-1 pr-32 relative ${editMode ? "pointer-events-none select-none" : ""}`}>
            {mockLyrics.map((line, i) => (
              <div key={i} className="relative group">
                <div className="flex items-center gap-2">
                  {analysisMode && (
                    <button
                      onClick={() => handleAnalysisSelect(i)}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        selectedForAnalysis.includes(i)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {selectedForAnalysis.includes(i) && <Check className="w-3 h-3" />}
                    </button>
                  )}
                  <div className="flex-1">
                    <LyricLineItem
                      line={line}
                      index={i}
                      isSelected={selectedLine === i}
                      isPlaying={currentPlayLine === i}
                      onSelect={handleLineClick}
                      onTechniqueHover={handleTechniqueHover}
                      onTechniquePin={handleTechniquePin}
                      onBreathHover={handleBreathHover}
                      onBreathPin={handleBreathPin}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Free-form Annotations */}
            {annotations.map((anno) => {
              const isHovered = hoveredAnnotationId === anno.id;
              return (
              <div
                key={anno.id}
                draggable={editMode && isHovered}
                onDragStart={(e) => handleAnnotationDragStart(e, anno)}
                onDragEnd={(e) => handleAnnotationDragEnd(anno.id, e)}
                onMouseEnter={() => editMode && setHoveredAnnotationId(anno.id)}
                onMouseLeave={() => editMode && setHoveredAnnotationId(null)}
                className={`absolute z-20 transition-all annotation-item ${editMode ? "pointer-events-auto" : "pointer-events-auto"}`}
                style={{ 
                  left: `${anno.x}%`, 
                  top: `${anno.y}%`, 
                  transform: `rotate(${anno.rotation}deg)`,
                }}
              >
                {/* Selection outline + drag handle (only on hover in edit mode) */}
                {editMode && isHovered && (
                  <div className="absolute inset-0 -m-1.5 border-2 border-dashed border-primary/50 rounded-md pointer-events-none" />
                )}

                {/* Drag handle indicator */}
                {editMode && isHovered && (
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 cursor-grab pointer-events-auto opacity-80">
                    <div className="w-1 h-1 rounded-full bg-primary/60" />
                    <div className="w-1 h-1 rounded-full bg-primary/60" />
                    <div className="w-1 h-1 rounded-full bg-primary/60" />
                    <div className="w-1 h-1 rounded-full bg-primary/60" />
                    <div className="w-1 h-1 rounded-full bg-primary/60" />
                    <div className="w-1 h-1 rounded-full bg-primary/60" />
                  </div>
                )}

                {anno.type === "text" ? (
                  <div className={`relative ${anno.color}`} style={{ fontFamily: "'Kalam', cursive, sans-serif" }}>
                    <p className={`text-[14px] leading-relaxed font-medium select-none whitespace-nowrap ${editMode && isHovered ? 'cursor-move' : ''}`}>
                      {anno.text}
                    </p>
                    {/* Hand-drawn underline effect */}
                    <svg className="absolute -bottom-1 left-0 w-full h-2 opacity-40" preserveAspectRatio="none">
                      <path d="M 0 5 Q 50 2 100 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                ) : anno.type === "circle" ? (
                  <svg width={anno.width} height={anno.height} viewBox="0 0 100 50" className={`${anno.color} ${editMode && isHovered ? 'cursor-move' : ''}`}>
                    <path 
                      d="M 5 25 C 5 5, 95 5, 95 25 C 95 45, 5 45, 8 28" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                      className="animate-in fade-in duration-700"
                    />
                  </svg>
                ) : (
                  <div 
                    className={`h-6 rounded-sm ${anno.color} ${editMode && isHovered ? 'cursor-move' : ''}`}
                    style={{ width: anno.width, opacity: 0.5 }}
                  />
                )}

                {/* Delete button - only visible on hover in edit mode */}
                {editMode && isHovered && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAnnotation(anno.id);
                    }}
                    className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-all z-30 pointer-events-auto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
            })}

            {/* Key sections */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <ChevronDown className="w-4 h-4" />
                  重点难点片段
                </h3>
                {!analysisMode ? (
                  <Button 
                    size="sm"
                    onClick={() => setAnalysisMode(true)}
                    className="bg-gradient-primary text-primary-foreground shadow-glow text-xs font-bold hover:opacity-90 hover:bg-transparent hover:text-primary-foreground transition-all border-0"
                  >
                    <BarChart3 className="w-3.5 h-3.5 mr-1" /> 圈选歌词进行唱功分析
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={handleSelectAll}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {selectedForAnalysis.length === mockLyrics.length ? "取消全选" : "全选"}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {selectedForAnalysis.length > 0 ? `已选 ${selectedForAnalysis.length} 句` : "请选择连续歌词"}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setAnalysisMode(false);
                        setSelectedForAnalysis([]);
                      }}
                    >
                      取消
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-gradient-primary text-primary-foreground shadow-glow text-xs"
                      disabled={selectedForAnalysis.length === 0}
                      onClick={() => {
                        const selectedLyrics = selectedForAnalysis
                          .sort((a, b) => a - b)
                          .map(idx => mockLyrics[idx].lyrics)
                          .join(" | ");
                        navigate(`/coach?new=1&mode=singing-analysis&ref=qfl&lyrics=${encodeURIComponent(selectedLyrics)}`);
                      }}
                    >
                      <BarChart3 className="w-3.5 h-3.5 mr-1" /> 进入分析
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid gap-3">
                {[
                  { label: "最值得模仿", line: "心之所动 且就随缘去吧", reason: "混声过渡自然，颤音控制精准", lyrics: "心之所动 且就随缘去吧" },
                  { label: "技巧最明显", line: "逆着光行走 任风吹雨打", reason: "假声→直音切换，情感对比强烈", lyrics: "逆着光行走 任风吹雨打" },
                  { label: "适合练习", line: "不知不觉 已经翻山越岭", reason: "混声→假声转换，换声点清晰", lyrics: "不知不觉 已经翻山越岭" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors cursor-pointer">
                    <span className="text-xs font-medium text-primary bg-accent px-2 py-1 rounded-md flex-shrink-0">{item.label}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.line}</p>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto flex-shrink-0 text-xs"
                      onClick={() => navigate(`/coach?new=1&mode=singing-analysis&ref=qfl&lyrics=${encodeURIComponent(item.lyrics)}`)}
                    >
                      练这一句
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Annotation panel */}
        <div className="w-80 lg:w-96 border-l border-border bg-card overflow-y-auto px-6 py-6 hidden md:block">
          <AnnotationPanel
            activeTechnique={activeTech}
            selectedLine={selectedLine}
            showBreathInfo={showBreathInfo}
            onFavorite={handleFavorite}
            isRegistered={isRegistered}
          />
        </div>

        {/* Floating Action Button for Edit Mode */}
        <div className="absolute bottom-8 right-8 z-50 flex flex-col items-end gap-3">
          {/* Tool Selector (Only in Edit Mode) */}
          {editMode && (
            <div className="flex flex-col gap-2 mb-2 animate-in slide-in-from-bottom-4 duration-300">
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full shadow-md gap-2 h-9 mb-2"
                onClick={clearAllAnnotations}
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs">清空</span>
              </Button>

              {/* Color Picker */}
              <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl p-3.5 flex flex-col gap-3 shadow-2xl mb-2 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">笔触颜色</span>
                </div>
                <div className="flex gap-2.5 items-center">
                  {availableColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setActiveColor(color.value)}
                      className="relative flex flex-col items-center gap-1 group/color"
                      title={color.name}
                    >
                      <div className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ring-offset-2 ring-offset-card ${
                        activeColor === color.value 
                          ? "ring-2 ring-primary scale-110" 
                          : "hover:scale-110 ring-1 ring-transparent hover:ring-border"
                      } ${color.bg}`}>
                        {activeColor === color.value && <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />}
                      </div>
                      <span className={`text-[9px] transition-colors ${activeColor === color.value ? 'text-foreground font-semibold' : 'text-muted-foreground group-hover/color:text-foreground'}`}>
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {[
                { id: "text", icon: <StickyNote className="w-4 h-4" />, label: "文字" },
                { id: "circle", icon: <Circle className="w-4 h-4" />, label: "圈选" },
              ].map((tool) => (
                <Button
                  key={tool.id}
                  size="sm"
                  variant={activeTool === tool.id ? "default" : "secondary"}
                  className="rounded-full shadow-md gap-2 h-9"
                  onClick={() => setActiveTool(tool.id as "text" | "circle")}
                >
                  {tool.icon}
                  <span className="text-xs">{tool.label}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Tooltip logic updated */}
          {!editMode ? (
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-bounce">
              点击开启编辑模式，在笔记上涂涂改改 ✍️
            </div>
          ) : (
            <div className="bg-success text-success-foreground px-4 py-2 rounded-full text-xs font-bold shadow-lg">
              正在编辑：点击页面添加{activeTool === "text" ? "文字" : "圈选"}
            </div>
          )}
          
          <Button
            size="lg"
            onClick={() => {
              setEditMode(!editMode);
              setAnalysisMode(false);
              if (!editMode) {
                toast.info("进入编辑模式：选择工具并点击页面添加标注");
              }
            }}
            className={`rounded-full w-14 h-14 shadow-2xl transition-all ${editMode ? "bg-success hover:bg-success/90 rotate-90" : "bg-primary hover:bg-primary/90"}`}
          >
            {editMode ? <Check className="w-6 h-6" /> : <Edit3 className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-primary" />
              添加个人笔记
            </DialogTitle>
            <DialogDescription className="text-xs">
              在点击位置添加你的心得、感悟或练习提醒。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={currentNoteText}
              onChange={(e) => setCurrentNoteText(e.target.value)}
              placeholder="输入你的笔记内容..."
              className="min-h-[100px] text-sm"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => {
              setNoteDialogOpen(false);
              setPendingCoords(null);
            }}>取消</Button>
            <Button size="sm" onClick={saveNote}>保存笔记</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                登录后即可永久保存您的声乐笔记和技巧心得
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

export default VocalNotesPage;
