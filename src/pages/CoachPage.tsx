import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Music, Plus, Send, PanelLeftClose, PanelLeft, MessageSquare,
  FileMusic, Mic, BookOpen, BarChart3, ChevronRight, CheckCircle2, Zap,
  Sparkles, ArrowRight, Info
} from "lucide-react";

const historyChats = [
  { id: 0, title: "《起风了》声乐技巧和唱功…", time: "示范会话", isDemo: true },
  { id: 1, title: "《起风了》副歌技巧分析", time: "今天" },
  { id: 2, title: "《光年之外》高音练习", time: "昨天" },
  { id: 3, title: "混声换声衔接练习", time: "3天前" },
];

interface VocalNoteData {
  title: string;
  stats: { label: string; value: string; color: string }[];
}

interface SingingAnalysisData {
  score: number;
  feedback: string;
  suggestion: string;
  details: { label: string; value: number; color: string }[];
}

type AudioSource = "reference" | "practice" | "analyzed-song" | "vocal-notes";

const audioSourceLabels: Record<AudioSource, { label: string; icon: typeof FileMusic; color: string }> = {
  "reference": { label: "参考唱段", icon: FileMusic, color: "text-primary" },
  "practice": { label: "我的练唱", icon: Mic, color: "text-success" },
  "analyzed-song": { label: "已分析歌曲", icon: BookOpen, color: "text-info" },
  "vocal-notes": { label: "Vocal Notes", icon: Music, color: "text-warning" },
};

type Message = {
  role: "ai" | "user";
  content?: string;
  type?: "text" | "buttons" | "vocal-note-card" | "upload-guide" | "singing-analysis-card" | "audio-upload";
  buttons?: { label: string; action?: string }[];
  audioFiles?: { name: string; size: string; source?: AudioSource }[];
  data?: VocalNoteData | SingingAnalysisData;
};

const mockMessages: Message[] = [
  {
    role: "ai",
    type: "text",
    content: "Hello! 👋 我是你的 AI 声乐教练。我可以帮你：\n\n1. **声乐笔记**：上传歌曲，AI 自动拆解唱法与技巧\n2. **唱功分析**：对比你的练唱与原唱，提供多维度反馈（查看上传指引）\n3. **练习建议**：根据你的表现，推荐针对性的练习方案",
  },
  {
    role: "user",
    type: "audio-upload",
    content: "帮我分析一下这首歌的声乐技巧",
    audioFiles: [{ name: "起风了_原唱.mp3", size: "4.2MB", source: "reference" }]
  },
  {
    role: "ai",
    type: "vocal-note-card",
    data: {
      title: "《起风了》声乐笔记摘要",
      stats: [
        { label: "混声", value: "4处", color: "bg-primary" },
        { label: "颤音", value: "2处", color: "bg-info" },
        { label: "假声", value: "1处", color: "bg-warning" },
      ]
    }
  },
  {
    role: "user",
    type: "text",
    content: "我练了一版，帮我看看"
  },
  {
    role: "ai",
    type: "upload-guide",
  },
  {
    role: "user",
    type: "audio-upload",
    audioFiles: [
      { name: "起风了_原唱.mp3", size: "4.2MB", source: "analyzed-song" },
      { name: "alex_take_03.wav", size: "2.8MB", source: "practice" }
    ]
  },
  {
    role: "ai",
    type: "singing-analysis-card",
    data: {
      score: 85,
      feedback: "整体音准表现良好，但在高音部分的混声切换略显生硬。",
      suggestion: "建议加强 G4-B4 频段的混声支撑练习。",
      details: [
        { label: "音准", value: 90, color: "bg-success" },
        { label: "节奏", value: 88, color: "bg-info" },
        { label: "技巧", value: 75, color: "bg-warning" },
        { label: "气息", value: 82, color: "bg-primary" },
      ]
    }
  }
];

/* ========== Vocal Note Summary Card (Improved: wider, better visual) ========== */
const VocalNoteSummaryCard = ({ data, onViewFull }: { data: VocalNoteData, onViewFull: () => void }) => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all w-full max-w-lg group cursor-pointer" onClick={onViewFull}>
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">声乐笔记摘要</span>
        </div>
        <Badge variant="outline" className="text-[10px] h-5 px-2 border-primary/20 text-primary font-semibold">AI 分析</Badge>
      </div>
      
      {/* Title */}
      <div>
        <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{data.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">检测到 3 个关键乐句 · 7 个技巧标注 · 2026年4月1日</p>
      </div>

      {/* Waveform + Stats Row */}
      <div className="flex gap-4 items-stretch">
        {/* Mini Waveform */}
        <div className="flex-1 relative bg-accent/40 rounded-xl border border-border/50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0 60 Q 25 20, 50 60 T 100 60 T 150 60 T 200 60 T 250 60 T 300 60 T 350 60 T 400 60" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            </svg>
          </div>
          <div className="z-10 flex gap-[3px] items-end h-14">
            {[25, 50, 38, 72, 45, 85, 60, 35, 68, 42, 78, 30].map((h, i) => (
              <div key={i} className="w-2 rounded-t-sm transition-all" style={{ height: `${h}%`, background: `hsl(245 58% ${51 + i * 2}%)` }} />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2 w-36">
          {data.stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-accent/30 border border-border/30">
              <div className={`w-2.5 h-2.5 rounded-full ${stat.color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium leading-none">{stat.label}</p>
                <p className="text-sm font-bold leading-tight mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-center text-primary text-xs font-bold gap-1.5 pt-3 border-t border-border/50 group-hover:gap-2.5 transition-all">
        查看完整分析 <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  </div>
);

/* ========== Upload Guide Card (Improved: clearer, not upload-target-like) ========== */
const UploadGuideCard = () => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm w-full max-w-lg">
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">唱功分析 · 上传指引</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-base font-bold">如何开始唱功分析？</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1">
          你需要提供一个<strong className="text-foreground">参考唱段</strong>和<strong className="text-foreground">你的练唱</strong>，AI 会逐句对比并给出反馈。
        </p>
      </div>

      {/* Step 1: Reference */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">1</span>
          选择参考唱段
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed pl-7">
          参考唱段来源可以是以下任意一种：
        </p>
        <div className="pl-7 space-y-1.5">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <FileMusic className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span><strong className="text-foreground">上传本地音频</strong> — 从手机/电脑选择音频文件</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5 text-info flex-shrink-0" />
            <span><strong className="text-foreground">选择已分析歌曲</strong> — 从你已分析过的歌曲中选择</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Music className="w-3.5 h-3.5 text-warning flex-shrink-0" />
            <span><strong className="text-foreground">选择 Vocal Notes 歌曲</strong> — 从声乐笔记中选择</span>
          </div>
        </div>
      </div>

      {/* Step 2: Practice */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">2</span>
          上传你的练唱
        </div>
        <div className="pl-7">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Mic className="w-3.5 h-3.5 text-success flex-shrink-0" />
            <span><strong className="text-foreground">上传练唱录音</strong> — 你练习演唱的音频文件</span>
          </div>
        </div>
      </div>

      {/* How to upload hint */}
      <div className="p-3.5 rounded-xl bg-accent/60 border border-border/50 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Plus className="w-3 h-3 text-primary" />
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          点击下方输入框左侧的 <strong className="text-primary">"+"</strong> 按钮，从弹出菜单中选择对应的上传入口即可。
        </p>
      </div>
    </div>
  </div>
);

/* ========== Singing Analysis Summary Card (Improved visual) ========== */
const SingingAnalysisSummaryCard = ({ data, onViewFull }: { data: SingingAnalysisData, onViewFull: () => void }) => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all w-full max-w-lg group cursor-pointer" onClick={onViewFull}>
    <div className="p-5 space-y-4">
      {/* Header with Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">唱功分析摘要</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${data.score}, 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-primary">{data.score}</span>
          </div>
        </div>
      </div>

      {/* Dimension Bars */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {(data as SingingAnalysisData).details?.map((d, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground font-medium">{d.label}</span>
              <span className="font-bold">{d.value}</span>
            </div>
            <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
              <div className={`h-full ${d.color} rounded-full transition-all duration-1000`} style={{ width: `${d.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      <div className="p-3.5 rounded-xl bg-accent/40 border border-border/40">
        <p className="text-sm leading-relaxed">{data.feedback}</p>
      </div>

      {/* Suggestion */}
      <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 space-y-1.5">
        <div className="flex items-center gap-1.5 text-primary">
          <Zap className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">下一步练习建议</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{data.suggestion}</p>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-center text-primary text-xs font-bold gap-1.5 pt-3 border-t border-border/50 group-hover:gap-2.5 transition-all">
        查看完整分析报告 <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  </div>
);

/* ========== Audio Upload with Source Badge ========== */
const AudioFileItem = ({ file }: { file: { name: string; size: string; source?: AudioSource } }) => {
  const sourceInfo = file.source ? audioSourceLabels[file.source] : null;
  const SourceIcon = sourceInfo?.icon || FileMusic;
  
  // For system resources (analyzed songs or vocal notes), use a different visual style
  if (file.source === "analyzed-song" || file.source === "vocal-notes") {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all min-w-[240px] group cursor-pointer">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center overflow-hidden relative">
          <img 
            src={`https://picsum.photos/seed/${file.name}/100/100`} 
            alt="cover" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <SourceIcon className={`w-4 h-4 ${sourceInfo?.color || "text-primary"}`} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{file.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-[8px] h-3.5 px-1 py-0 font-medium">
              {sourceInfo?.label}
            </Badge>
            <span className="text-[9px] text-muted-foreground">点击查看详情</span>
          </div>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-all" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 border border-border/50 min-w-[220px]">
      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
        <SourceIcon className={`w-4 h-4 ${sourceInfo?.color || "text-primary"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[10px] text-muted-foreground">{file.size}</p>
          {sourceInfo && (
            <Badge variant="outline" className="text-[8px] h-3.5 px-1 py-0 border-border/50 text-muted-foreground font-medium">
              {sourceInfo.label}
            </Badge>
          )}
        </div>
      </div>
      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
    </div>
  );
};

/* ========== Demo Banner at bottom ========== */
const DemoBanner = () => (
  <div className="flex items-center justify-center gap-3 py-5 px-4">
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-accent/60 border border-border/50 max-w-md">
      <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
      <p className="text-xs text-muted-foreground leading-relaxed">
        这是一个<strong className="text-foreground">示范会话</strong>，展示 AI Coach 的核心功能。点击左侧
        <strong className="text-primary"> 「+ 新对话」</strong> 开始你自己的探索吧！
      </p>
      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
    </div>
  </div>
);

const newChatIntroMessage: Message = {
  role: "ai",
  type: "text",
  content: "Hello! 👋 我是你的 AI 声乐教练。我可以帮你：\n\n1. **声乐笔记**：上传歌曲，AI 自动拆解唱法与技巧\n2. **唱功分析**：对比你的练唱与原唱，提供多维度反馈（查看[上传指引]）\n3. **练习建议**：根据你的表现，推荐针对性的练习方案",
};

const CoachPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewChat = searchParams.get("new") === "1";
  const analysisMode = searchParams.get("mode");
  const refSong = searchParams.get("ref");
  const selectedLyrics = searchParams.get("lyrics");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Build intro message based on mode
  const getIntroMessage = useCallback((): Message => {
    if (analysisMode === "singing-analysis" && refSong) {
      const lyricsInfo = selectedLyrics 
        ? `\n\n📋 **已选参考唱段**：\n${decodeURIComponent(selectedLyrics)}`
        : "";
      return {
        role: "ai",
        type: "text",
        content: `Hello! 👋 我是你的 AI 声乐教练。\n\n你已选择以下唱段进行**唱功分析**：${lyricsInfo}\n\n接下来，请上传你的**练唱音频**，我会为你进行逐句对比分析，并提供精准的改进建议。\n\n💡 **操作指引**：点击下方 **"+"** 按钮，选择 **"上传我的练唱"** 即可开始！`,
      };
    }
    return newChatIntroMessage;
  }, [analysisMode, refSong, selectedLyrics]);

  const [isNewConversation, setIsNewConversation] = useState(isNewChat);
  const [newMessages, setNewMessages] = useState<Message[]>([getIntroMessage()]);
  const [showUploadGuideInNew, setShowUploadGuideInNew] = useState(false);
  const messages = isNewConversation 
    ? [...newMessages, ...(showUploadGuideInNew ? [{ role: "ai" as const, type: "upload-guide" as const }] : [])]
    : mockMessages;
  const [input, setInput] = useState("");
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [activeChat, setActiveChat] = useState(isNewChat ? -1 : 0);

  useEffect(() => {
    if (isNewChat) {
      setIsNewConversation(true);
      setActiveChat(-1);
      setNewMessages([getIntroMessage()]);
      setShowUploadGuideInNew(false);
    }
  }, [isNewChat, getIntroMessage]);

  const handleSend = () => {
    if (!input.trim()) return;
    setInput("");
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 overflow-hidden border-r border-border bg-sidebar flex-shrink-0`}
      >
        <div className="w-64 h-full flex flex-col">
          {/* Sidebar header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Music className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm">VocalInsight</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
              <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* New chat */}
          <div className="px-3 mb-2">
            <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => {
              setIsNewConversation(true);
              setActiveChat(-1);
              setNewMessages([newChatIntroMessage]);
              setShowUploadGuideInNew(false);
            }}>
              <Plus className="w-4 h-4" /> 新对话
            </Button>
          </div>

          {/* Nav links */}
          <div className="px-3 space-y-1 mb-2">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-primary/10 text-primary border border-primary/20 font-medium transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> AI Coach
            </button>
            <button
              onClick={() => navigate("/vocal-notes-library")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
            >
              <Music className="w-4 h-4" /> Vocal Notes
            </button>
            <button onClick={() => navigate("/practice-records")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent text-sidebar-foreground transition-colors">
              <BarChart3 className="w-4 h-4" /> 练习记录
            </button>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            <p className="text-xs text-muted-foreground px-2 py-2 font-medium">历史会话</p>
            {historyChats.map((chat) => {
              const isActive = chat.id === activeChat;
              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat.id);
                    if (chat.id === 0) {
                      setIsNewConversation(false);
                      setShowUploadGuideInNew(false);
                    }
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors truncate ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                      : "hover:bg-sidebar-accent text-sidebar-foreground"
                  }`}
                >
                  <MessageSquare className={`w-3.5 h-3.5 inline mr-2 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {chat.title}
                  <span className={`block text-xs mt-0.5 ${isActive ? "text-primary/60" : "text-muted-foreground"}`}>
                    {chat.time}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sidebar bottom nav */}
          <div className="p-3 border-t border-sidebar-border space-y-1">
            <button onClick={() => navigate("/profile")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent text-sidebar-foreground transition-colors">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">A</div>
              个人中心
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-14 border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
          <h1 className="text-sm font-semibold">AI Coach</h1>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <Music className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div className={`space-y-3 ${msg.role === "user" ? "max-w-[85%]" : "max-w-[90%] flex-1"}`}>
                    {msg.content && (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-card border border-border rounded-bl-md"
                        } ${msg.type === "text" && msg.role === "ai" && analysisMode === "singing-analysis" ? "border-primary/20 bg-primary/5 ring-1 ring-primary/10" : ""}`}
                      >
                        {msg.content.split(/(\[上传指引\]|\*\*.*?\*\*)/).map((part, idx) => {
                          if (part === "[上传指引]") {
                            return (
                              <span 
                                key={idx} 
                                className="text-primary font-bold underline cursor-pointer hover:opacity-80 decoration-2 underline-offset-2"
                                onClick={() => {
                                  if (isNewConversation) {
                                    setShowUploadGuideInNew(true);
                                  }
                                }}
                              >
                                上传指引
                              </span>
                            );
                          }
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={idx} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </div>
                    )}

                    {msg.type === "audio-upload" && msg.audioFiles && (
                      <div className="space-y-2">
                        {msg.audioFiles.map((file, idx) => (
                          <AudioFileItem key={idx} file={file} />
                        ))}
                      </div>
                    )}

                    {msg.type === "vocal-note-card" && (
                      <VocalNoteSummaryCard 
                        data={msg.data as VocalNoteData} 
                        onViewFull={() => navigate("/vocal-notes")} 
                      />
                    )}

                    {msg.type === "upload-guide" && (
                      <UploadGuideCard />
                    )}

                    {msg.type === "singing-analysis-card" && (
                      <SingingAnalysisSummaryCard 
                        data={msg.data as SingingAnalysisData} 
                        onViewFull={() => navigate("/vocal-analysis")} 
                      />
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center ml-3 flex-shrink-0 mt-0.5 border border-border">
                      <div className="text-[10px] font-bold">ME</div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Demo Banner - only show for demo chat */}
            {!isNewConversation && <DemoBanner />}
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto relative">
            <div className="flex items-end gap-2 bg-card border border-border rounded-2xl px-4 py-3">
              <div className="relative">
                <button
                  onClick={() => setShowUploadMenu(!showUploadMenu)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </button>
                {showUploadMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-lg py-2 w-56 animate-scale-in z-50">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors">
                      <FileMusic className="w-4 h-4 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-xs">上传参考唱段</p>
                        <p className="text-[10px] text-muted-foreground">本地音频文件</p>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors">
                      <Mic className="w-4 h-4 text-success" />
                      <div className="text-left">
                        <p className="font-medium text-xs">上传我的练唱</p>
                        <p className="text-[10px] text-muted-foreground">你的演唱录音</p>
                      </div>
                    </button>
                    <div className="h-px bg-border mx-3 my-1" />
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors">
                      <BookOpen className="w-4 h-4 text-info" />
                      <div className="text-left">
                        <p className="font-medium text-xs">选择已分析歌曲</p>
                        <p className="text-[10px] text-muted-foreground">从历史分析中选择</p>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors">
                      <Music className="w-4 h-4 text-warning" />
                      <div className="text-left">
                        <p className="font-medium text-xs">选择 Vocal Notes 歌曲</p>
                        <p className="text-[10px] text-muted-foreground">从声乐笔记中选择</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="输入你的问题，例如：如何练习混声？怎样提高高音稳定性？"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground text-left py-2"
              />
              <button
                onClick={handleSend}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachPage;
