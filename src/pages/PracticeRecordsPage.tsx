import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Music, MessageSquare, Plus, PanelLeftClose, PanelLeft,
  BarChart3, Star, Clock, CheckCircle2,
  Target, Zap, Trophy, Flame, Lock, ArrowRight
} from "lucide-react";

const historyChats = [
  { id: 0, title: "《起风了》声乐技巧和唱功…", time: "示范会话", isDemo: true },
];

/* ===== Mock Data ===== */

interface AnalysisRecord {
  id: string;
  songTitle: string;
  artist: string;
  score: number;
  date: string;
  dimensions: { label: string; value: number }[];
  highlight: string;
}

const mockAnalysisHistory: AnalysisRecord[] = [
  {
    id: "1",
    songTitle: "起风了",
    artist: "买辣椒也用券",
    score: 85,
    date: "2026-04-01",
    dimensions: [
      { label: "音准", value: 90 },
      { label: "节奏", value: 88 },
      { label: "技巧", value: 75 },
      { label: "气息", value: 82 },
    ],
    highlight: "混声切换略显生硬，高音支撑不足",
  },
];

interface SkillNode {
  id: string;
  label: string;
  status: "completed" | "current" | "locked";
  description: string;
}

const skillPath: SkillNode[] = [
  { id: "s1", label: "气息稳定", status: "current", description: "腹式呼吸 · 气息支撑稳定性 ≥85%" },
  { id: "s2", label: "换声区突破", status: "locked", description: "换声区过渡 · 混声衔接" },
  { id: "s3", label: "混声进阶", status: "locked", description: "全音域混声 · 动态切换" },
  { id: "s4", label: "颤音控制", status: "locked", description: "自然颤音 · 频率与幅度控制" },
];

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  locked: boolean;
  xp: number;
}

const dailyChallenges: DailyChallenge[] = [
  { id: "d1", title: "气息长音练习", description: "保持均匀气息支撑 15 秒长音", completed: true, locked: false, xp: 250 },
  { id: "d2", title: "换声预演（弱声滑音练习）", description: "C4-G4 弱声滑音，感受换声区过渡", completed: false, locked: false, xp: 500 },
  { id: "d3", title: "音阶上下行", description: "C大调音阶 × 3 组，注意气息均匀分配", completed: false, locked: false, xp: 500 },
];

const mainQuest = {
  title: "气息支撑稳定性",
  progress: 68,
  currentStep: "稳定性需达到 85% 才能解锁下一阶段",
  totalSteps: 5,
  completedSteps: 3,
};

/* ===== Components ===== */

const PracticeRecordsPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"history" | "progress">("progress");

  const completedChallenges = dailyChallenges.filter(c => c.completed).length;
  const totalXP = dailyChallenges.filter(c => c.completed).reduce((s, c) => s + c.xp, 0);
  const currentSkill = skillPath.find(s => s.status === "current");

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#FAFAF7" }}>
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden flex-shrink-0 border-r border-gray-100`}
        style={{ background: "#FFFFFF" }}
      >
        <div className="w-64 h-full flex flex-col">
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

          <div className="px-3 mb-3">
            <button
              onClick={() => navigate("/coach?new=1")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium"
            >
              <Plus className="w-4 h-4" /> 新对话
            </button>
          </div>

          <div className="px-3 space-y-0.5 mb-3">
            {[
              { icon: MessageSquare, label: "声乐老师", active: false, onClick: () => navigate("/coach") },
              { icon: Music, label: "声乐笔记", active: false, onClick: () => navigate("/vocal-notes-library") },
              { icon: BarChart3, label: "练习记录", active: true, onClick: undefined },
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

          <div className="flex-1 overflow-y-auto px-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 py-2">历史会话</p>
            <div className="space-y-0.5">
              {historyChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => navigate("/coach")}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-gray-300" />
                    <span className="truncate text-xs font-medium">{chat.title}</span>
                  </div>
                  <p className="text-[10px] mt-0.5 pl-5 text-gray-400">{chat.time}</p>
                </button>
              ))}
            </div>
          </div>

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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            {/* Header + Tabs */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3 min-w-0">
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="mt-0.5 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <PanelLeft className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-foreground">练习记录</h1>
                  <p className="text-sm text-muted-foreground mt-1">追踪你的练习进度与技能成长</p>
                </div>
              </div>
              <div className="flex bg-muted/80 rounded-full p-0.5 border border-border/70">
                <button
                  onClick={() => setActiveTab("progress")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === "progress" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  练习进度
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === "history" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  唱功分析历史
                </button>
              </div>
            </div>

            {activeTab === "progress" && (
              <div className="space-y-8">
                {/* Main Quest */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm">当前主线任务</h3>
                        <Badge variant="outline" className="text-[10px] h-5 px-2 border-primary/20 text-primary font-semibold">进行中</Badge>
                      </div>
                      <p className="text-lg font-bold mt-1">{mainQuest.title}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">当前稳定性 {mainQuest.progress}%（目标 ≥85%）</span>
                      <span className="font-bold text-primary">{mainQuest.progress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-accent rounded-full overflow-hidden relative">
                      <div className="h-full bg-gradient-primary rounded-full transition-all duration-700" style={{ width: `${mainQuest.progress}%` }} />
                      {/* 85% threshold marker */}
                      <div className="absolute top-0 h-full w-px bg-foreground/30" style={{ left: '85%' }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/60 border border-border/50">
                    <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      {mainQuest.currentStep}
                    </p>
                  </div>

                  <Button variant="hero" size="sm" className="w-full" onClick={() => navigate("/coach?new=1&mode=singing-analysis&ref=qfl")}>
                    继续练习 <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Skill Path */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">技能进阶路径</h3>
                      <p className="text-xs text-muted-foreground">当前阶段：{currentSkill?.label}</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-border" />
                    <div className="space-y-1">
                      {skillPath.map((node) => (
                        <div key={node.id} className="flex items-center gap-4 relative">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                            node.status === "completed"
                              ? "bg-success text-success-foreground"
                              : node.status === "current"
                              ? "bg-gradient-primary text-primary-foreground ring-4 ring-primary/20"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {node.status === "completed" ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : node.status === "current" ? (
                              <Flame className="w-4 h-4" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className={`flex-1 p-3 rounded-xl border transition-colors ${
                            node.status === "current"
                              ? "bg-primary/5 border-primary/20"
                              : node.status === "completed"
                              ? "bg-accent/40 border-border/50"
                              : "bg-muted/30 border-border/30 opacity-60"
                          }`}>
                            <p className={`text-sm font-semibold ${node.status === "current" ? "text-primary" : ""}`}>{node.label}</p>
                            <p className="text-[11px] text-muted-foreground">{node.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Daily Challenges */}
                <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">每日挑战</h3>
                        <p className="text-xs text-muted-foreground">今日进度 {completedChallenges}/{dailyChallenges.length}</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none text-xs font-bold">
                      +{totalXP} XP
                    </Badge>
                  </div>

                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-primary rounded-full transition-all" style={{ width: `${(completedChallenges / dailyChallenges.length) * 100}%` }} />
                  </div>

                  <div className="space-y-3">
                    {dailyChallenges.map((challenge) => (
                      <div key={challenge.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        challenge.completed
                          ? "bg-card border-border/50 opacity-60"
                          : challenge.locked
                          ? "bg-muted/20 border-border/30 opacity-50"
                          : "bg-card border-border hover:border-primary/20"
                      }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          challenge.completed
                            ? "bg-success text-success-foreground"
                            : challenge.locked
                            ? "bg-muted text-muted-foreground"
                            : "border-2 border-border"
                        }`}>
                          {challenge.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {challenge.locked && <Lock className="w-3 h-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${challenge.locked ? "text-muted-foreground" : ""}`}>{challenge.title}</p>
                          <p className="text-[11px] text-muted-foreground">{challenge.description}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] h-5 px-2 flex-shrink-0">+{challenge.xp} XP</Badge>
                        {!challenge.completed && !challenge.locked && (
                          <Button variant="hero" size="sm" className="text-xs flex-shrink-0 gap-1.5" onClick={() => navigate("/coach?new=1")}>
                            <Zap className="w-3 h-3" /> 开始练习
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: "总分析次数", value: mockAnalysisHistory.length.toString(), icon: BarChart3 },
                    { label: "最高分", value: Math.max(...mockAnalysisHistory.map(r => r.score)).toString(), icon: Star },
                    { label: "累计练习天数", value: "12", icon: Clock },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border/70 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <stat.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground leading-none">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {mockAnalysisHistory.map((record, index) => (
                    <button
                      key={record.id}
                      onClick={() => navigate("/vocal-analysis")}
                      className="w-full text-left p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">第 {index + 1} 次</span>
                            <span className="text-[11px] text-muted-foreground">{record.date}</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">《{record.songTitle}》 · {record.artist}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{record.highlight}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-black text-primary leading-none">{record.score}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">综合评分</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {record.dimensions.map((d) => (
                          <div key={d.label} className="rounded-xl bg-accent/50 px-3 py-2">
                            <p className="text-[10px] text-muted-foreground">{d.label}</p>
                            <p className="text-sm font-bold text-foreground">{d.value}</p>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeRecordsPage;
