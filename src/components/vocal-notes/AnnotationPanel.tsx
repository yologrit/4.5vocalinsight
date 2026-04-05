import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, BookOpen, Wind, Edit3 } from "lucide-react";
import { techniqueColors, techniqueLabels, techniqueDetails, mockLyrics } from "./types";

interface AnnotationPanelProps {
  activeTechnique: string | null;
  selectedLine: number | null;
  showBreathInfo: boolean;
  onFavorite: () => void;
  isRegistered: boolean;
}

const dislikeReasons = [
  "技巧识别不对",
  "位置标错了",
  "解释不清楚",
  "其他",
];

const breathInfo = {
  description:
    "换气点标记了歌词中适合呼吸的位置。合理的换气能保证气息充足，让下一个乐句的发声更加稳定和有力。",
  tip:
    "在换气点快速用口鼻同时吸气，不用刻意压低换气的声音——自然的换气声是正常的，专注于吸气的深度和速度即可。",
};

const AnnotationPanel = ({ activeTechnique, selectedLine, showBreathInfo, onFavorite, isRegistered }: AnnotationPanelProps) => {
  // Use a map to store feedback state for each technique
  const [feedbackState, setFeedbackState] = useState<Record<string, {
    likeCount: number;
    hasLiked: boolean;
    showDislikeOptions: boolean;
    selectedDislike: string | null;
    isTechFavorited: boolean;
    correctionText: string;
    isSubmitted: boolean;
  }>>({});

  // Get current state or default
  const currentTech = activeTechnique || "none";
  const state = feedbackState[currentTech] || {
    likeCount: Math.floor(Math.random() * 20) + 5, // Random initial count for demo
    hasLiked: false,
    showDislikeOptions: false,
    selectedDislike: null,
    isTechFavorited: false,
    correctionText: "",
    isSubmitted: false,
  };

  const updateState = (updates: Partial<typeof state>) => {
    setFeedbackState(prev => ({
      ...prev,
      [currentTech]: { ...state, ...updates }
    }));
  };

  const handleLike = () => {
    if (!state.hasLiked) {
      updateState({
        likeCount: state.likeCount + 1,
        hasLiked: true,
        showDislikeOptions: false,
        selectedDislike: null
      });
    } else {
      updateState({
        likeCount: state.likeCount - 1,
        hasLiked: false
      });
    }
  };

  const handleTechFavorite = () => {
    onFavorite();
    if (isRegistered) {
      updateState({ isTechFavorited: !state.isTechFavorited });
    }
  };

  const handleDislike = () => {
    const updates: Partial<typeof state> = {
      showDislikeOptions: !state.showDislikeOptions,
      selectedDislike: null
    };
    if (state.hasLiked) {
      updates.likeCount = state.likeCount - 1;
      updates.hasLiked = false;
    }
    updateState(updates);
  };

  const handleDislikeReason = (reason: string) => {
    updateState({
      selectedDislike: reason,
      isSubmitted: false
    });
  };

  const handleSubmitCorrection = () => {
    updateState({ isSubmitted: true });
    // In a real app, send correctionText and selectedDislike to backend
  };

  // Breath feedback state
  const breathState = feedbackState["breath"] || {
    likeCount: Math.floor(Math.random() * 15) + 3,
    hasLiked: false,
    showDislikeOptions: false,
    selectedDislike: null,
    isTechFavorited: false,
    correctionText: "",
    isSubmitted: false,
  };

  const updateBreathState = (updates: Partial<typeof breathState>) => {
    setFeedbackState(prev => ({
      ...prev,
      breath: { ...breathState, ...updates }
    }));
  };

  const handleBreathLike = () => {
    if (!breathState.hasLiked) {
      updateBreathState({ likeCount: breathState.likeCount + 1, hasLiked: true, showDislikeOptions: false });
    } else {
      updateBreathState({ likeCount: breathState.likeCount - 1, hasLiked: false });
    }
  };

  const handleBreathDislike = () => {
    const updates: Partial<typeof breathState> = {
      showDislikeOptions: !breathState.showDislikeOptions,
    };
    if (breathState.hasLiked) {
      updates.likeCount = breathState.likeCount - 1;
      updates.hasLiked = false;
    }
    updateBreathState(updates);
  };

  const handleBreathCorrectionSubmit = () => {
    updateBreathState({ isSubmitted: true });
  };

  // Show breath info panel
  if (showBreathInfo) {
    return (
      <div className="animate-fade-in" key="breath">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-accent text-accent-foreground border-border">
            换气点
          </span>
          <span className="text-xs text-muted-foreground">Breath Mark</span>
        </div>

        <h3 className="text-sm font-semibold mb-2">换气点作用</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {breathInfo.description}
        </p>

        <h3 className="text-sm font-semibold mb-2">换气技巧</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {breathInfo.tip}
        </p>

        {selectedLine !== null && (
          <div className="p-4 rounded-xl bg-accent border border-border mb-6">
            <p className="text-xs text-muted-foreground mb-1">当前乐句</p>
            <p className="text-sm font-medium">{mockLyrics[selectedLine]?.lyrics}</p>
          </div>
        )}

        {/* Feedback for breath mark */}
        <div className="pt-6 border-t border-border mt-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBreathLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                breathState.hasLiked
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-accent/50 text-muted-foreground hover:bg-accent border border-transparent"
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${breathState.hasLiked ? "fill-current" : ""}`} />
              有帮助 {breathState.likeCount}
            </button>
            <button
              onClick={handleBreathDislike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                breathState.showDislikeOptions
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : "bg-accent/50 text-muted-foreground hover:bg-accent border border-transparent"
              }`}
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${breathState.showDislikeOptions ? "fill-current" : ""}`} />
              不太对
            </button>
          </div>

          {breathState.showDislikeOptions && !breathState.isSubmitted && (
            <div className="space-y-2 animate-fade-in">
              <p className="text-[10px] text-muted-foreground px-1">如果换气点位置不对，请描述正确的位置（可选）：</p>
              <textarea
                value={breathState.correctionText}
                onChange={(e) => updateBreathState({ correctionText: e.target.value })}
                placeholder="例如：换气点应该在「翻涌」之后而不是之前..."
                className="w-full h-20 bg-background border border-border rounded-lg p-2 text-xs outline-none focus:border-primary/30 resize-none"
              />
              <button
                onClick={handleBreathCorrectionSubmit}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all"
              >
                提交纠正
              </button>
            </div>
          )}

          {breathState.isSubmitted && (
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-[10px] text-center animate-fade-in">
              感谢您的反馈！我们会尽快核实并修正。
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!activeTechnique || !techniqueDetails[activeTechnique]) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">悬停歌词中的技巧标签</p>
        <p className="text-xs text-muted-foreground mt-1">查看详细注解</p>
      </div>
    );
  }

  const isTransition = activeTechnique.includes("-");
  const [fromType, toType] = isTransition ? activeTechnique.split("-") : [activeTechnique, null];

  return (
    <div className="animate-fade-in" key={activeTechnique}>
      <div className="flex items-center gap-2 mb-4">
        {isTransition ? (
          <div className="flex items-center gap-1">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${techniqueColors[fromType]}`}>
              {techniqueLabels[fromType]?.cn}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${techniqueColors[toType!]}`}>
              {techniqueLabels[toType!]?.cn}
            </span>
          </div>
        ) : (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${techniqueColors[activeTechnique]}`}>
            {techniqueLabels[activeTechnique]?.cn}
          </span>
        )}
        <span className="text-xs text-muted-foreground">{techniqueLabels[activeTechnique]?.en}</span>
      </div>

      <h3 className="text-sm font-semibold mb-2">{isTransition ? "转换技巧说明" : "技巧说明"}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        {techniqueDetails[activeTechnique].description}
      </p>

      <h3 className="text-sm font-semibold mb-2">{isTransition ? "衔接建议" : "练习建议"}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        {techniqueDetails[activeTechnique].tip}
      </p>

      {selectedLine !== null && (
        <div className="p-4 rounded-xl bg-accent border border-border mb-6">
          <p className="text-xs text-muted-foreground mb-1">当前乐句</p>
          <p className="text-sm font-medium">{mockLyrics[selectedLine]?.lyrics}</p>
        </div>
      )}

      {/* Feedback */}
      <div className="pt-6 border-t border-border mt-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              state.hasLiked
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-accent/50 text-muted-foreground hover:bg-accent border border-transparent"
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${state.hasLiked ? "fill-current" : ""}`} />
            有帮助 {state.likeCount}
          </button>
          <button
            onClick={handleDislike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              state.showDislikeOptions || state.selectedDislike
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-accent/50 text-muted-foreground hover:bg-accent border border-transparent"
            }`}
          >
            <ThumbsDown className={`w-3.5 h-3.5 ${state.showDislikeOptions || state.selectedDislike ? "fill-current" : ""}`} />
            不太对
          </button>
          
          <button 
            onClick={handleTechFavorite}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ml-auto ${
              state.isTechFavorited 
                ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20" 
                : "bg-accent/50 text-muted-foreground hover:bg-accent border border-transparent"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${state.isTechFavorited ? "fill-current" : ""}`} />
            收藏
          </button>
        </div>

        {state.showDislikeOptions && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-3 rounded-xl bg-accent/30 border border-border grid grid-cols-2 gap-2">
              {dislikeReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleDislikeReason(reason)}
                  className={`text-[10px] py-1.5 px-2 rounded-lg text-left transition-all ${
                    state.selectedDislike === reason
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background/50 text-muted-foreground hover:bg-background"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {state.selectedDislike && !state.isSubmitted && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-[10px] text-muted-foreground px-1">请提供正确的描述或建议（可选）：</p>
                <textarea
                  value={state.correctionText}
                  onChange={(e) => updateState({ correctionText: e.target.value })}
                  placeholder="例如：这里应该是混声而不是假声..."
                  className="w-full h-20 bg-background border border-border rounded-lg p-2 text-xs outline-none focus:border-primary/30 resize-none"
                />
                <button
                  onClick={handleSubmitCorrection}
                  className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all"
                >
                  提交勘误
                </button>
              </div>
            )}

            {state.isSubmitted && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-[10px] text-center animate-fade-in">
                感谢您的反馈！我们会尽快核实并修正。
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnotationPanel;
