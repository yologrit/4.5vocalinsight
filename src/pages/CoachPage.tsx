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

const newChatIntroMessage: Message = {
  role: "ai",
  type: "text",
  content: "Hello! 👋 我是你的 AI 声乐教练。我可以帮你：\n\n1. **声乐笔记**：上传歌曲，AI 自动拆解唱法与技巧\n2. **唱功分析**：对比你的练唱与原唱，提供多维度反馈（查看[上传指引]）\n3. **练习建议**：根据你的表现，推荐针对性的练习方案",
};

/* ── VocalNoteSummaryCard ── */
const VocalNoteSummaryCard = ({ data, onViewFull }: { data: VocalNoteData; onViewFull: () => void }) => (
  <div
    onClick={onViewFull}
    className="group cursor-pointer w-full max-w-lg rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    style={{ boxShadow: "0 2px 16px -4px rgba(79,70,229,0.10), 0 1px 3px rgba(0,0,0,0.04)" }}
  >
    <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #4F46E5 0%, #818CF8 50%, #34D399 100%)" }} />
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 leading-none mb-1">声乐笔记摘要</p>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">{data.title}</h3>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex-shrink-0">AI 分析</span>
      </div>

      {/* Stats */}
      <div className="flex gap-2">
        {data.stats.map(({ label, value, color }) => (
          <div key={label} className="flex-1 flex flex-col items-center py-2.5 rounded-xl bg-gray-50 gap-1">
            <span className="text-lg font-black text-gray-900">{value}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${color}`}>{label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-gray-100 text-indigo-600 text-xs font-semibold group-hover:gap-2.5 transition-all">
        查看完整分析 <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  </div>
);

/* ── UploadGuideCard ── */
const UploadGuideCard = () => (
  <div
    className="w-full max-w-lg rounded-2xl bg-white overflow-hidden"
    style={{ boxShadow: "0 2px 16px -4px rgba(79,70,229,0.10), 0 1px 3px rgba(0,0,0,0.04)" }}
  >
    <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #6366F1 0%, #34D399 100%)" }} />
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Info className="w-3.5 h-3.5 text-indigo-600" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">唱功分析 · 上传指引</span>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900">如何开始唱功分析？</h3>
        <p className="text-xs text-gray-500 leading-relaxed mt-1">
          提供<strong className="text-gray-800">参考唱段</strong>和<strong className="text-gray-800">你的练唱</strong>，AI 逐句对比并给出反馈。
        </p>
      </div>

      {/* Steps with vertical connector line */}
      <div className="relative pl-4">
        <div className="absolute left-[18px] top-5 bottom-5 w-px bg-gradient-to-b from-indigo-200 to-emerald-200" />
        {[
          { step: "1", title: "选择参考唱段", color: "bg-indigo-600", items: [
            { icon: FileMusic, color: "text-indigo-500", label: "上传本地音频", desc: "从手机/电脑选择" },
            { icon: BookOpen, color: "text-sky-500", label: "选择已分析歌曲", desc: "从历史分析中选择" },
            { icon: Music, color: "text-amber-500", label: "选择 Vocal Notes", desc: "从声乐笔记中选择" },
          ]},
          { step: "2", title: "上传你的练唱", color: "bg-emerald-500", items: [
            { icon: Mic, color: "text-emerald-500", label: "上传练唱录音", desc: "你练习演唱的音频" },
          ]},
        ].map(({ step, title, color, items }) => (
          <div key={step} className="relative mb-4 last:mb-0">
            <div className="flex items-center gap-2.5 mb-2">
              <span className={`w-5 h-5 rounded-full ${color} text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 z-10 relative`}>{step}</span>
              <span className="text-xs font-semibold text-gray-800">{title}</span>
            </div>
            <div className="pl-7 space-y-1.5">
              {items.map(({ icon: Icon, color: ic, label, desc }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-gray-500 py-1">
                  <Icon className={`w-3.5 h-3.5 ${ic} flex-shrink-0`} />
                  <span><strong className="text-gray-700 font-medium">{label}</strong><span className="text-gray-400"> — {desc}</span></span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50 border border-indigo-100/80">
        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Plus className="w-3 h-3 text-indigo-600" />
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          点击输入框左侧 <strong className="text-indigo-600">"+"</strong> 按钮，从弹出菜单选择对应入口。
        </p>
      </div>
    </div>
  </div>
);

/* ── SingingAnalysisSummaryCard ── */
const SingingAnalysisSummaryCard = ({ data, onViewFull }: { data: SingingAnalysisData; onViewFull: () => void }) => (
  <div
    onClick={onViewFull}
    className="group cursor-pointer w-full max-w-lg rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    style={{ boxShadow: "0 2px 16px -4px rgba(79,70,229,0.10), 0 1px 3px rgba(0,0,0,0.04)" }}
  >
    <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #4F46E5 0%, #22C55E 100%)" }} />
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 leading-none mb-1">唱功分析摘要</p>
            <h3 className="text-base font-bold text-gray-900 leading-tight">综合得分 <span className="text-indigo-600">{data.score}</span> 分</h3>
          </div>
        </div>
      </div>

      {/* Dimension bars */}
      <div className="space-y-2">
        {data.details?.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-8 flex-shrink-0">{d.label}</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${d.value}%`, background: d.value >= 88 ? "#22C55E" : d.value >= 78 ? "#4F46E5" : "#F59E0B" }} />
            </div>
            <span className="text-xs font-bold text-gray-700 w-6 text-right">{d.value}</span>
          </div>
        ))}
      </div>

      {/* Feedback */}
      <div className="px-3 py-2.5 rounded-xl bg-gray-50 border-l-2 border-indigo-300">
        <p className="text-xs text-gray-600 leading-relaxed">{data.feedback}</p>
      </div>

      {/* Suggestion */}
      <div className="px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-2">
        <Zap className="w-3 h-3 text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-700 leading-relaxed">{data.suggestion}</p>
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-gray-100 text-indigo-600 text-xs font-semibold group-hover:gap-2.5 transition-all">
        查看完整分析报告 <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  </div>
);

/* ── AudioFileItem ── */
const AudioFileItem = ({ file }: { file: { name: string; size: string; source?: AudioSource } }) => {
  const sourceInfo = file.source ? audioSourceLabels[file.source] : null;
  const SourceIcon = sourceInfo?.icon || FileMusic;

  if (file.source === "analyzed-song" || file.source === "vocal-notes") {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all min-w-[240px] group cursor-pointer">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden relative">
          <img src={`https://picsum.photos/seed/${file.name}/100/100`} alt="cover" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <SourceIcon className={`w-4 h-4 ${sourceInfo?.color || "text-primary"}`} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate group-hover:text-indigo-600 transition-colors">{file.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{sourceInfo?.label}</span>
            <span className="text-[9px] text-gray-400">点击查看详情</span>
          </div>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 min-w-[220px]">
      <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
        <SourceIcon className={`w-4 h-4 ${sourceInfo?.color || "text-primary"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate text-gray-700">{file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[10px] text-gray-400">{file.size}</p>
          {sourceInfo && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-white border border-gray-100 text-gray-400">{sourceInfo.label}</span>}
        </div>
      </div>
      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
    </div>
  );
};

/* ── DemoBanner ── */
const DemoBanner = () => (
  <div className="flex items-center justify-center py-6 px-4">
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 max-w-md">
      <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
      <p className="text-xs text-gray-500 leading-relaxed">
        这是一个<strong className="text-gray-700">示范会话</strong>，展示 AI Coach 的核心功能。点击左侧
        <strong className="text-indigo-600"> 「+ 新对话」</strong> 开始你自己的探索吧！
      </p>
      <ArrowRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
    </div>
  </div>
);

/* ══════════════════════════════════════════
   CoachPage — Score Sheet Design System
══════════════════════════════════════════ */
const CoachPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewChat = searchParams.get("new") === "1";
  const analysisMode = searchParams.get("mode");
  const refSong = searchParams.get("ref");
  const selectedLyrics = searchParams.get("lyrics");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="h-screen flex overflow-hidden" style={{ background: "#FAFAF7" }}>

      {/* ── Sidebar ── */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden flex-shrink-0 border-r border-gray-100`}
        style={{ background: "#FFFFFF" }}
      >
        <div className="w-64 h-full flex flex-col">

          {/* Logo */}
          <div className="px-4 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Music className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-gray-900 tracking-tight">VocalInsight</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <PanelLeftClose className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* New chat */}
          <div className="px-3 mb-3">
            <button
              onClick={() => {
                setIsNewConversation(true);
                setActiveChat(-1);
                setNewMessages([newChatIntroMessage]);
                setShowUploadGuideInNew(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium"
            >
              <Plus className="w-4 h-4" /> 新对话
            </button>
          </div>

          {/* Nav */}
          <div className="px-3 space-y-0.5 mb-3">
            {[
              { icon: MessageSquare, label: "声乐老师", active: true, onClick: undefined },
              { icon: Music, label: "声乐笔记", active: false, onClick: () => navigate("/vocal-notes-library") },
              { icon: BarChart3, label: "练习记录", active: false, onClick: () => navigate("/practice-records") },
            ].map(({ icon: Icon, label, active, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto px-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 py-2">历史会话</p>
            <div className="space-y-0.5">
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
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-indigo-500" : "text-gray-300"}`} />
                      <span className="truncate text-xs font-medium">{chat.title}</span>
                    </div>
                    <p className={`text-[10px] mt-0.5 pl-5 ${isActive ? "text-indigo-400" : "text-gray-400"}`}>{chat.time}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">A</div>
              个人中心
            </button>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <div className="h-14 border-b border-gray-100 flex items-center px-5 gap-3 flex-shrink-0 bg-white/90 backdrop-blur-md">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors mr-1">
              <PanelLeft className="w-4 h-4 text-gray-400" />
            </button>
          )}
          {/* Session title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800 truncate">
                {activeChat === 0 ? "《起风了》声乐技巧和唱功分析" : activeChat === -1 ? "新对话" : historyChats.find(c => c.id === activeChat)?.title ?? "AI Coach"}
              </span>
              {activeChat === 0 && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-500 border border-amber-100 flex-shrink-0">示范</span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-none">AI Coach · VocalInsight</p>
          </div>
          {/* Online indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-medium text-emerald-600">在线</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-10 space-y-7">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                style={{ animation: "fadeSlideIn 0.25s ease both", animationDelay: `${i * 0.04}s` }}
              >
                <div className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 shadow-sm">
                      <Music className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div className={`space-y-3 ${msg.role === "user" ? "max-w-[80%]" : "max-w-[90%] flex-1"}`}>
                    {msg.content && (
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white rounded-br-md shadow-sm"
                            : "bg-white border border-gray-100 rounded-bl-md text-gray-800"
                        } ${msg.type === "text" && msg.role === "ai" && analysisMode === "singing-analysis" ? "border-indigo-100 bg-indigo-50" : ""}`}
                        style={msg.role === "ai" ? { boxShadow: "0 1px 4px rgba(0,0,0,0.04)" } : {}}
                      >
                        {msg.content.split(/(\[上传指引\]|\*\*.*?\*\*)/).map((part, idx) => {
                          if (part === "[上传指引]") {
                            return (
                              <span
                                key={idx}
                                className="text-indigo-600 font-semibold underline cursor-pointer hover:opacity-80 decoration-2 underline-offset-2"
                                onClick={() => { if (isNewConversation) setShowUploadGuideInNew(true); }}
                              >
                                上传指引
                              </span>
                            );
                          }
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={idx} className="font-semibold">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </div>
                    )}

                    {msg.type === "audio-upload" && msg.audioFiles && (
                      <div className="space-y-2">
                        {msg.audioFiles.map((file, idx) => <AudioFileItem key={idx} file={file} />)}
                      </div>
                    )}
                    {msg.type === "vocal-note-card" && (
                      <VocalNoteSummaryCard data={msg.data as VocalNoteData} onViewFull={() => navigate("/vocal-notes")} />
                    )}
                    {msg.type === "upload-guide" && <UploadGuideCard />}
                    {msg.type === "singing-analysis-card" && (
                      <SingingAnalysisSummaryCard data={msg.data as SingingAnalysisData} onViewFull={() => navigate("/vocal-analysis")} />
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center ml-3 flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-gray-500">ME</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!isNewConversation && <DemoBanner />}
          </div>
        </div>

        {/* Input */}
        <div className="px-6 pb-6 pt-3 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            <div
              className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 transition-shadow focus-within:border-indigo-200"
              style={{ boxShadow: "0 2px 16px -4px rgba(79,70,229,0.10), 0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <div className="relative">
                <button
                  onClick={() => setShowUploadMenu(!showUploadMenu)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-400" />
                </button>
                {showUploadMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-100 rounded-2xl py-2 w-56 z-50"
                    style={{ boxShadow: "0 8px 32px -4px rgba(0,0,0,0.12)" }}>
                    {[
                      { icon: FileMusic, color: "text-indigo-500", label: "上传参考唱段", desc: "本地音频文件" },
                      { icon: Mic, color: "text-emerald-500", label: "上传我的练唱", desc: "你的演唱录音" },
                    ].map(({ icon: Icon, color, label, desc }) => (
                      <button key={label} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <div className="text-left">
                          <p className="text-xs font-semibold text-gray-700">{label}</p>
                          <p className="text-[10px] text-gray-400">{desc}</p>
                        </div>
                      </button>
                    ))}
                    <div className="h-px bg-gray-100 mx-3 my-1" />
                    {[
                      { icon: BookOpen, color: "text-sky-500", label: "选择已分析歌曲", desc: "从历史分析中选择" },
                      { icon: Music, color: "text-amber-500", label: "选择 Vocal Notes 歌曲", desc: "从声乐笔记中选择" },
                    ].map(({ icon: Icon, color, label, desc }) => (
                      <button key={label} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <div className="text-left">
                          <p className="text-xs font-semibold text-gray-700">{label}</p>
                          <p className="text-[10px] text-gray-400">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="输入你的问题，例如：如何练习混声？怎样提高高音稳定性？"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-300 text-gray-800 py-2"
              />

              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CoachPage;
