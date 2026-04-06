import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Music, MessageSquare, Plus, PanelLeftClose, PanelLeft,
  BarChart3, User, Star, Target, Settings,
  Heart, ChevronRight, Mail, MessageCircle, Edit3,
  Bookmark, FileText
} from "lucide-react";

const historyChats = [
  { id: 0, title: "《起风了》声乐技巧和唱功…", time: "示范会话", isDemo: true },
];

/* Mock user data from onboarding */
const userProfile = {
  name: "Alex",
  email: "alex@example.com",
  avatar: "A",
  joinDate: "2026-03-20",
  onboarding: {
    goal: "搞定某首特定的高难度歌曲",
    level: "我会自己跟着教程练",
    stuckAt: "听不出来原唱这句到底怎么唱",
    improve: ["听懂原唱具体怎么唱", "音准控制", "在特定音区中演唱/切换"],
    belief: "相信，我愿意投入时间",
  },
  currentGoal: "掌握「起风了」副歌混声技巧",
};

interface FavoriteItem {
  id: string;
  type: "technique_song" | "technique_phrase" | "comparison" | "task";
  title: string;
  subtitle: string;
  source: string;
  date: string;
}

const favorites: FavoriteItem[] = [
  { id: "f1", type: "technique_phrase", title: "混声过渡技巧", subtitle: "「心之所动 且就随缘去吧」混声→假声过渡", source: "起风了 · 声乐笔记", date: "2026-04-01" },
  { id: "f2", type: "technique_phrase", title: "颤音控制", subtitle: "副歌尾音 5Hz 自然颤音", source: "起风了 · 声乐笔记", date: "2026-03-31" },
  { id: "f3", type: "comparison", title: "副歌第一段对比", subtitle: "「逆着光行走 任风吹雨打」得分 82/100", source: "起风了 · 唱功分析", date: "2026-04-01" },
  { id: "f5", type: "task", title: "每日音阶练习", subtitle: "C大调音阶上下行 × 3 组", source: "每日挑战", date: "2026-03-29" },
  { id: "f6", type: "technique_song", title: "起风了", subtitle: "买辣椒也用券 · 完整声乐笔记", source: "声乐笔记库", date: "2026-04-01" },
];

const favoriteTypeConfig: Record<string, { icon: typeof Star; color: string; label: string }> = {
  technique_song: { icon: Star, color: "text-info", label: "歌曲收藏" },
  technique_phrase: { icon: Star, color: "text-info", label: "乐句收藏" },
  comparison: { icon: Star, color: "text-primary", label: "对比记录" },
  task: { icon: Star, color: "text-success", label: "任务模块" },
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<"profile" | "favorites" | "feedback">("profile");
  const [feedbackText, setFeedbackText] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredFavorites = filterType === "all" ? favorites : favorites.filter(f => f.type === filterType);

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
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-600 transition-all"
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
          <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
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
                  <h1 className="text-2xl font-bold text-foreground">个人中心</h1>
                  <p className="text-sm text-muted-foreground mt-1">管理资料、收藏与反馈</p>
                </div>
              </div>
            </div>

            {/* User header */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {userProfile.avatar}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{userProfile.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {userProfile.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">加入于 {userProfile.joinDate}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" /> 编辑
                </Button>
              </div>
            </div>

            {/* Section tabs */}
            <div className="flex bg-muted/80 rounded-full p-0.5 border border-border/70 w-fit">
              {[
                { key: "profile" as const, label: "基本资料", icon: User },
                { key: "favorites" as const, label: "收藏夹", icon: Star },
                { key: "feedback" as const, label: "反馈", icon: MessageCircle },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeSection === tab.key
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              ))}
            </div>

            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="xl:col-span-2 space-y-4">
                  <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-sm">当前目标</h3>
                    </div>
                    <p className="text-sm bg-accent/60 rounded-xl p-3 border border-border/50">{userProfile.currentGoal}</p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-sm">偏好设置</h3>
                    </div>
                    <div className="grid gap-2.5">
                      {[
                        { label: "界面语言", value: "简体中文" },
                        { label: "通知提醒", value: "开启每日练习提醒" },
                        { label: "分析详细度", value: "详细模式" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-accent/40 border border-border/40">
                          <span className="text-sm">{item.label}</span>
                          <span className="text-sm text-muted-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="xl:col-span-3 bg-card border border-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-sm">Onboarding 信息</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-primary">
                      <Edit3 className="w-3 h-3 mr-1" /> 修改
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {[
                      { label: "唱歌目标", value: userProfile.onboarding.goal },
                      { label: "当前水平", value: userProfile.onboarding.level },
                      { label: "常见卡点", value: userProfile.onboarding.stuckAt },
                      { label: "想提升的方面", value: userProfile.onboarding.improve.join("、") },
                      { label: "练习信念", value: userProfile.onboarding.belief },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 p-3 rounded-xl bg-accent/30 border border-border/30">
                        <span className="text-xs text-muted-foreground font-medium w-24 flex-shrink-0 pt-0.5">{item.label}</span>
                        <span className="text-sm flex-1">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Favorites Section */}
            {activeSection === "favorites" && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">按类型筛选</p>
                  <div className="flex gap-2 flex-wrap mt-3">
                    {[
                      { key: "all", label: "全部" },
                      { key: "technique_song", label: "歌曲收藏" },
                      { key: "technique_phrase", label: "乐句收藏" },
                      { key: "comparison", label: "对比记录" },
                      { key: "task", label: "任务模块" },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setFilterType(f.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          filterType === f.key
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {filteredFavorites.map((item) => {
                    const config = favoriteTypeConfig[item.type];
                    const Icon = config.icon;
                    return (
                      <div key={item.id} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                            <Icon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{item.title}</h4>
                              <Badge variant="outline" className="text-[9px] h-4 px-1.5">{config.label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">{item.source} · {item.date}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredFavorites.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-2xl">
                    <Bookmark className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">该类别下暂无收藏</p>
                  </div>
                )}
              </div>
            )}

            {/* Feedback Section */}
            {activeSection === "feedback" && (
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="xl:col-span-3 bg-card border border-border rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">你更希望析音先怎么帮助你？</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">你的反馈将帮助我们改进产品</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "更精准的唱功分析反馈",
                      "更多歌曲的声乐笔记",
                      "实时录音分析功能",
                      "社区交流和学习",
                      "更个性化的练习计划",
                      "视频教程和范唱对比",
                    ].map((option, i) => (
                      <button
                        key={i}
                        className="p-3 rounded-xl border border-border bg-accent/30 text-sm text-center flex items-center justify-center hover:border-primary/30 hover:bg-primary/5 transition-all"
                        onClick={() => setFeedbackText(prev => prev ? `${prev}、${option}` : option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-4">
                  <p className="text-xs font-medium text-muted-foreground">补充说明</p>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="请描述你希望析音如何帮助你..."
                    className="w-full h-40 bg-accent/50 border border-border rounded-xl p-3 text-sm outline-none focus:border-primary/30 resize-none transition-colors"
                  />
                  <div className="text-[11px] text-muted-foreground">我们会优先处理高频反馈。</div>
                  <Button variant="hero" className="w-full" disabled={!feedbackText.trim()}>
                    提交反馈
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
