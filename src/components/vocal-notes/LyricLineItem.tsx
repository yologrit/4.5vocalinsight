import { useRef, useEffect } from "react";
import { LyricLine, techniqueColors, techniqueTextColors, techniqueRawColors } from "./types";

interface LyricLineItemProps {
  line: LyricLine;
  index: number;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: (index: number) => void;
  onTechniqueHover: (type: string | null) => void;
  onTechniquePin: (type: string | null) => void;
  onBreathHover: (hover: boolean) => void;
  onBreathPin: () => void;
}

/**
 * Render lyric characters with technique-based coloring.
 * When two techniques overlap on adjacent ranges, apply a CSS gradient
 * on the boundary characters for a smooth color transition.
 */
const renderColoredLyrics = (line: LyricLine, isPlaying: boolean) => {
  const chars = [...line.lyrics];
  const nonBreathTechs = line.techniques.filter(t => t.type !== "breath");

  // Build per-char technique map (last writer wins for overlapping)
  const charTechMap: (string | null)[] = chars.map(() => null);
  nonBreathTechs.forEach((tech) => {
    for (let i = tech.startIdx; i < Math.min(tech.endIdx, chars.length); i++) {
      charTechMap[i] = tech.type;
    }
  });

  // Detect adjacent technique transitions: only mark chars at the boundary
  // A transition exists when two techniques are adjacent (endIdx of one == startIdx of next, or within 1 char)
  type CharInfo =
    | { kind: "single"; type: string | null }
    | { kind: "gradient"; from: string; to: string };

  const charInfos: CharInfo[] = chars.map((_, i) => ({
    kind: "single" as const,
    type: charTechMap[i],
  }));

  // Find adjacent/overlapping technique pairs and mark their full ranges as gradient
  const sortedTechs = [...nonBreathTechs].sort((a, b) => a.startIdx - b.startIdx);
  for (let t = 0; t < sortedTechs.length - 1; t++) {
    const curr = sortedTechs[t];
    const next = sortedTechs[t + 1];
    // Only apply gradient if they are directly adjacent or overlapping (no gap)
    if (next.startIdx - curr.endIdx <= 0) {
      const rangeStart = curr.startIdx;
      // If next technique has no text color, gradient only covers curr range
      const nextHasColor = !!techniqueTextColors[next.type];
      const rangeEnd = nextHasColor
        ? Math.min(chars.length - 1, next.endIdx - 1)
        : Math.min(chars.length - 1, curr.endIdx - 1);
      for (let i = rangeStart; i <= rangeEnd; i++) {
        charInfos[i] = { kind: "gradient", from: curr.type, to: next.type };
      }
    }
  }

  // Group consecutive chars with same rendering
  const segments: { text: string; info: CharInfo }[] = [];
  if (chars.length === 0) return [];
  let current = { text: chars[0], info: charInfos[0] };

  const infoKey = (info: CharInfo) =>
    info.kind === "single" ? `s:${info.type}` : `g:${info.from}-${info.to}`;

  for (let i = 1; i < chars.length; i++) {
    if (infoKey(charInfos[i]) === infoKey(current.info)) {
      current.text += chars[i];
    } else {
      segments.push(current);
      current = { text: chars[i], info: charInfos[i] };
    }
  }
  segments.push(current);

  return segments.map((seg, i) => {
    if (seg.info.kind === "gradient") {
      const fromColor = techniqueRawColors[seg.info.from] ?? "currentColor";
      const toColor = techniqueRawColors[seg.info.to] ?? "currentColor";
      return (
        <span
          key={i}
          className="font-medium"
          style={{
            backgroundImage: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {seg.text}
        </span>
      );
    }
    if (!seg.info.type) {
      return <span key={i}>{seg.text}</span>;
    }
    const colorClass = techniqueTextColors[seg.info.type] || "";
    return (
      <span key={i} className={`${colorClass} font-medium`}>
        {seg.text}
      </span>
    );
  });
};

const LyricLineItem = ({
  line,
  index,
  isSelected,
  isPlaying,
  onSelect,
  onTechniqueHover,
  onTechniquePin,
  onBreathHover,
  onBreathPin,
}: LyricLineItemProps) => {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isPlaying && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isPlaying]);

  return (
    <button
      ref={ref}
      onClick={() => onSelect(index)}
      className={`w-full text-center px-4 py-3.5 rounded-2xl transition-all duration-300 group/line ${
        isSelected
          ? "bg-primary/8 border border-primary/25 shadow-sm shadow-primary/10"
          : isPlaying
          ? "bg-accent/60 border border-transparent"
          : "border border-transparent hover:bg-accent/40 hover:border-border/40"
      } ${isPlaying ? "scale-[1.04]" : ""}`}
    >
      <div className="flex flex-col items-center">
        {/* Technique tags row */}
        <div className="relative flex items-end min-h-[28px] mb-6 w-full justify-center">
          <div className="relative" style={{ width: `${line.lyrics.length * 1.05}em` }}>
            {(() => {
              // Group adjacent/overlapping techniques
              const sortedTechs = [...line.techniques]
                .filter(t => t.type !== "breath")
                .sort((a, b) => a.startIdx - b.startIdx);
              
              const groups: typeof sortedTechs[] = [];
              if (sortedTechs.length > 0) {
                let currentGroup = [sortedTechs[0]];
                for (let i = 1; i < sortedTechs.length; i++) {
                  const prev = sortedTechs[i - 1];
                  const curr = sortedTechs[i];
                  // If they overlap or are adjacent (with up to 1 char gap)
                  if (curr.startIdx <= prev.endIdx + 1) {
                    currentGroup.push(curr);
                  } else {
                    groups.push(currentGroup);
                    currentGroup = [curr];
                  }
                }
                groups.push(currentGroup);
              }

              return groups.map((group, gIdx) => {
                const first = group[0];
                const last = group[group.length - 1];
                const offsetEm = first.startIdx * 1.05;
                
                if (group.length === 1) {
                  const tech = first;
                  return (
                    <span
                      key={gIdx}
                      onMouseEnter={() => onTechniqueHover(tech.type)}
                      onMouseLeave={() => onTechniqueHover(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTechniquePin(tech.type);
                      }}
                      className={`absolute inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all hover:scale-105 hover:shadow-md ${techniqueColors[tech.type]}`}
                      style={{ left: `${offsetEm}em` }}
                    >
                      {tech.text}
                    </span>
                  );
                } else {
                  // Merged tag for transitions
                  const mergedText = group.map(t => t.text).join(" → ");
                  const fromType = first.type;
                  const toType = last.type;
                  const transitionKey = `${fromType}-${toType}`;
                  
                  return (
                    <div
                      key={gIdx}
                      onMouseEnter={() => onTechniqueHover(transitionKey)}
                      onMouseLeave={() => onTechniqueHover(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTechniquePin(transitionKey);
                      }}
                      className="absolute inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all hover:scale-105 hover:shadow-md"
                      style={{
                        left: `${offsetEm}em`,
                        background: `linear-gradient(90deg, color-mix(in srgb, ${techniqueRawColors[fromType] ?? "#888"} 20%, transparent), color-mix(in srgb, ${techniqueRawColors[toType] ?? "#888"} 20%, transparent))`,
                        border: `1px solid color-mix(in srgb, ${techniqueRawColors[fromType] ?? "#888"} 40%, transparent)`,
                      }}
                    >
                      <span
                        style={{
                          backgroundImage: `linear-gradient(90deg, ${techniqueRawColors[fromType] ?? "#888"}, ${techniqueRawColors[toType] ?? "#888"})`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {mergedText}
                      </span>
                    </div>
                  );
                }
              });
            })()}
          </div>
        </div>

        {/* Lyrics row with colored characters + breath mark */}
        <div className="flex items-baseline gap-0 justify-center">
          <p
            className={`leading-relaxed tracking-widest transition-all duration-300 ${
              isPlaying ? "text-lg font-bold" : "text-base font-medium"
            }`}
          >
            {renderColoredLyrics(line, isPlaying)}
          </p>
          {line.breathMark && (
            <span
              onMouseEnter={() => onBreathHover(true)}
              onMouseLeave={() => onBreathHover(false)}
              onClick={(e) => {
                e.stopPropagation();
                onBreathPin();
              }}
              className="relative -top-2.5 ml-1 text-primary/60 text-sm font-bold select-none cursor-pointer hover:text-primary transition-colors"
              title="换气 Breath"
            >
              ᐯ
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default LyricLineItem;
