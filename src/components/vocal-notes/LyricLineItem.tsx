import { useRef, useEffect } from "react";
import { LyricLine, techniqueColors, techniqueTextColors } from "./types";

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

  // Build per-char technique map
  const charTechMap: (string | null)[] = chars.map(() => null);
  line.techniques.forEach((tech) => {
    if (tech.type === "breath") return;
    for (let i = tech.startIdx; i < Math.min(tech.endIdx, chars.length); i++) {
      charTechMap[i] = tech.type;
    }
  });

  // Detect transition zones: where technique changes between adjacent chars
  // For transition chars, store [fromType, toType]
  type CharInfo =
    | { kind: "single"; type: string | null }
    | { kind: "gradient"; from: string; to: string };

  const charInfos: CharInfo[] = chars.map((_, i) => ({
    kind: "single" as const,
    type: charTechMap[i],
  }));

  // Check for overlapping techniques on same char positions (transition markers)
  // e.g., line 7 has mixed and vibrato both covering indices 5-9
  // Also detect adjacent technique boundaries for gradient
  for (let i = 1; i < chars.length; i++) {
    const prev = charTechMap[i - 1];
    const curr = charTechMap[i];
    if (prev && curr && prev !== curr) {
      // Mark the boundary char as gradient
      charInfos[i] = { kind: "gradient", from: prev, to: curr };
    }
  }

  // Group consecutive chars with same rendering
  const segments: { text: string; info: CharInfo }[] = [];
  let current = { text: chars[0], info: charInfos[0] };

  const infoKey = (info: CharInfo) =>
    info.kind === "single"
      ? `s:${info.type}`
      : `g:${info.from}-${info.to}`;

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
      // CSS gradient text for transition
      const fromColor = techniqueTextColors[seg.info.from]?.replace("text-[", "").replace("]", "") || "currentColor";
      const toColor = techniqueTextColors[seg.info.to]?.replace("text-[", "").replace("]", "") || "currentColor";
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
      className={`w-full text-center px-4 py-3 rounded-xl transition-all duration-300 ${
        isSelected
          ? "bg-accent border border-primary/20"
          : isPlaying
          ? "bg-accent/50"
          : "hover:bg-accent/30"
      } ${isPlaying ? "scale-[1.03]" : ""}`}
    >
      <div className="flex flex-col items-center">
        {/* Technique tags row */}
        <div className="relative flex items-end min-h-[28px] mb-4 w-full justify-center">
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
                      className={`absolute inline-flex items-center px-1.5 py-0 rounded text-[10px] font-semibold border cursor-pointer transition-all hover:scale-105 hover:shadow-sm ${techniqueColors[tech.type]}`}
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
                    <span
                      key={gIdx}
                      onMouseEnter={() => onTechniqueHover(transitionKey)}
                      onMouseLeave={() => onTechniqueHover(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTechniquePin(transitionKey);
                      }}
                      className="absolute inline-flex items-center px-1.5 py-0 rounded text-[10px] font-semibold border cursor-pointer transition-all hover:scale-105 hover:shadow-sm bg-white"
                      style={{ 
                        left: `${offsetEm}em`,
                        background: `linear-gradient(90deg, var(--${fromType}-bg, #f3f4f6), var(--${toType}-bg, #f3f4f6))`,
                        borderColor: `var(--${fromType}-border, #d1d5db)`,
                        color: '#374151'
                      }}
                    >
                      {mergedText}
                    </span>
                  );
                }
              });
            })()}
          </div>
        </div>

        {/* Lyrics row with colored characters + breath mark */}
        <div className="flex items-baseline gap-0 justify-center">
          <p
            className={`leading-relaxed tracking-wider transition-all duration-300 ${
              isPlaying ? "text-lg font-bold" : "text-base"
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
              className="relative -top-2 ml-0.5 text-primary text-base font-semibold select-none cursor-pointer hover:opacity-100 opacity-70 transition-opacity"
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
