import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Music, Search, Filter, Clock, MessageSquare,
  ChevronRight, Sparkles, Plus, PanelLeftClose, PanelLeft,
  BarChart3
} from "lucide-react";

const historyChats = [
  { id: 0, title: "《起风了》声乐技巧和唱功…", time: "示范会话", isDemo: true },
  { id: 1, title: "《起风了》副歌技巧分析", time: "今天" },
  { id: 2, title: "《光年之外》高音练习", time: "昨天" },
  { id: 3, title: "混声换声衔接练习", time: "3天前" },
];

interface SongCard {
  id: string;
  title: string;
  artist: string;
  score: number;
  techniques: string[];
  duration: string;
  sessions: number;
  gradient: string;
}

const communitySongs: SongCard[] = [
  {
    id: "qfl",
    title: "起风了",
    artist: "买辣椒也用券",
    score: 90,
    techniques: ["胸声", "混声", "颤音"],
    duration: "4:56",
    sessions: 18,
    gradient: "from-[hsl(280,40%,25%)] to-[hsl(320,30%,20%)]",
  },
  {
    id: "rolling",
    title: "Rolling in the Deep",
    artist: "Adele",
    score: 92,
    techniques: ["胸声", "气泡音", "强混"],
    duration: "3:48",
    sessions: 12,
    gradient: "from-[hsl(350,35%,22%)] to-[hsl(20,30%,18%)]",
  },
  {
    id: "perfect",
    title: "Perfect",
    artist: "Ed Sheeran",
    score: 85,
    techniques: ["假声", "连音", "颤音"],
    duration: "4:23",
    sessions: 8,
    gradient: "from-[hsl(200,30%,20%)] to-[hsl(220,35%,25%)]",
  },
  {
    id: "someone",
    title: "Someone Like You",
    artist: "Adele",
    score: 78,
    techniques: ["头声", "情感强弱", "滑音"],
    duration: "4:45",
    sessions: 15,
    gradient: "from-[hsl(30,35%,20%)] to-[hsl(50,30%,18%)]",
  },
  {
    id: "stay",
    title: "Stay With Me",
    artist: "Sam Smith",
    score: 88,
    techniques: ["假声", "气声", "乐句处理"],
    duration: "2:52",
    sessions: 5,
    gradient: "from-[hsl(140,25%,18%)] to-[hsl(160,30%,22%)]",
  },
  {
    id: "gnzw",
    title: "光年之外",
    artist: "邓紫棋",
    score: 91,
    techniques: ["强混", "混声", "假声"],
    duration: "3:58",
    sessions: 10,
    gradient: "from-[hsl(260,35%,22%)] to-[hsl(280,30%,18%)]",
  },
];

const myNotes: SongCard[] = [
  {
    id: "qfl",
    title: "起风了",
    artist: "买辣椒也用券",
    score: 90,
    techniques: ["胸声", "混声", "颤音"],
    duration: "4:56",
    sessions: 18,
    gradient: "from-[hsl(280,40%,25%)] to-[hsl(320,30%,20%)]",
  },
];

const SongCardItem = ({ song, onView }: { song: SongCard; onView: () => void }) => (
  <div
    className="group cursor-pointer w-full rounded-2xl bg-card border border-border/70 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    onClick={onView}
  >
    <div className="p-4 sm:p-5 flex gap-4">
      <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex-shrink-0 overflow-hidden relative">
        <img
          src={`https://picsum.photos/seed/${song.id}/300/300`}
          alt={song.title}
          className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="space-y-2.5">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors">{song.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{song.artist}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3" /> {song.score}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {song.techniques.map((t, i) => (
              <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5 h-auto bg-accent/60 text-muted-foreground border-border/60 font-medium">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-3">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{song.duration}</span>
            <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" />{song.sessions}次</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  </div>
);

const VocalNotesLibraryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"community" | "my-notes">("community");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const songs = activeTab === "community" ? communitySongs : myNotes;
  const filteredSongs = searchQuery
    ? songs.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.techniques.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : songs;

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
              { icon: Music, label: "声乐笔记", active: true, onClick: undefined },
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
          <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
            {/* Header */}
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
                  <h1 className="text-2xl font-bold text-foreground">声乐笔记</h1>
                  <p className="text-muted-foreground text-sm mt-1">浏览已分析歌曲的唱法技巧拆解</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-muted/80 rounded-full p-0.5 border border-border/70">
                  <button
                    onClick={() => setActiveTab("community")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeTab === "community" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    社区
                  </button>
                  <button
                    onClick={() => setActiveTab("my-notes")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeTab === "my-notes" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    我的笔记
                  </button>
                </div>
                <Button className="bg-gradient-primary text-primary-foreground shadow-glow" onClick={() => navigate("/coach?new=1")}>
                  <Plus className="w-4 h-4 mr-1" /> 新建分析
                </Button>
              </div>
            </div>

            {/* How it works banner */}
            <div className="p-5 rounded-2xl bg-card border border-border/70">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">使用说明</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    浏览社区已分析的歌曲，学习唱法技巧。想分析自己喜欢的歌？点击「新建分析」开始与 AI Coach 对话。
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索歌曲、歌手或技巧..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="w-3.5 h-3.5" /> 筛选
              </Button>
            </div>

            {/* Songs grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSongs.map((song) => (
                <SongCardItem
                  key={song.id}
                  song={song}
                  onView={() => {
                    if (song.id === "qfl") navigate("/vocal-notes");
                  }}
                />
              ))}
            </div>

            {filteredSongs.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Music className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">没有找到匹配的歌曲</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocalNotesLibraryPage;
