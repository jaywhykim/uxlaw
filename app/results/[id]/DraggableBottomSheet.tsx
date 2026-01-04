"use client";

import { useState, useRef, useEffect } from "react";

type Severity = "Low" | "Medium" | "High";

type LawFinding = {
  title: string;
  severity: Severity;
  finding: string;
  why: string;
  fix: string;
};

function severityStyle(sev: Severity) {
  switch (sev) {
    case "High":
      return { borderColor: "#ff6b6b", background: "#2a1a1a", color: "#ff8a8a" };
    case "Medium":
      return { borderColor: "#ffd93d", background: "#2a2515", color: "#ffed4e" };
    case "Low":
    default:
      return { borderColor: "#666", background: "#1a1a1a", color: "#b0b0b0" };
  }
}

interface DraggableBottomSheetProps {
  id: string;
  score: number;
  narrative: string;
  topFixes: string[];
  laws: Record<string, LawFinding>;
}

export default function DraggableBottomSheet({
  id,
  score,
  narrative,
  topFixes,
  laws,
}: DraggableBottomSheetProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startDragYRef = useRef(0);
  const currentDragYRef = useRef(0);

  useEffect(() => {
    currentDragYRef.current = dragY;
  }, [dragY]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const deltaY = touch.clientY - startYRef.current;
      const maxDrag = window.innerHeight * 0.8; // 80% of viewport height
      // Calculate new position based on starting position plus drag delta
      const newPosition = Math.max(0, Math.min(maxDrag, startDragYRef.current + deltaY));
      
      setDragY(newPosition);
      currentDragYRef.current = newPosition;
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      // Snap to 80% position or back to 0
      const maxDrag = window.innerHeight * 0.8;
      const threshold = maxDrag * 0.5; // 50% of max drag to snap to bottom
      const finalPosition = currentDragYRef.current > threshold ? maxDrag : 0;
      setDragY(finalPosition);
      currentDragYRef.current = finalPosition;
    };

    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    // Store the current dragY position when drag starts
    startDragYRef.current = currentDragYRef.current;
    setIsDragging(true);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .draggable-bottom-sheet-${id} {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            flex-direction: row;
            gap: 16px;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory;
            padding: 24px 16px;
            padding-bottom: max(24px, env(safe-area-inset-bottom));
            padding-top: 32px;
            background: #0a0a0a;
            border-top: 1px solid #333;
            border-top-left-radius: 20px;
            border-top-right-radius: 20px;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            max-height: 80vh;
            touch-action: pan-y;
          }
          
          .draggable-bottom-sheet-${id}::before {
            content: '';
            position: absolute;
            top: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 4px;
            background: #333;
            border-radius: 2px;
          }
          
          .draggable-bottom-sheet-${id}::-webkit-scrollbar {
            height: 4px;
          }
          
          .draggable-bottom-sheet-${id}::-webkit-scrollbar-track {
            background: #1a1a1a;
            border-radius: 2px;
          }
          
          .draggable-bottom-sheet-${id}::-webkit-scrollbar-thumb {
            background: #444;
            border-radius: 2px;
          }
          
          .info-card-${id} {
            flex: 0 0 calc(100% - 32px);
            min-width: calc(100% - 32px);
            scroll-snap-align: start;
          }
          
          @media (min-width: 769px) {
            .draggable-bottom-sheet-${id} {
              display: none !important;
            }
          }
        `
      }} />
      <div
        ref={containerRef}
        className={`draggable-bottom-sheet-${id}`}
        style={{
          transform: `translateY(${dragY}px)`,
        }}
        onTouchStart={handleTouchStart}
      >
      {/* Card 1: Overall Score */}
      <section
        className={`info-card-${id}`}
        style={{
          background: "#1a1a1a",
          borderRadius: 12,
          padding: 16,
          minHeight: 120,
          border: "1px solid #333",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 16, color: "#ededed" }}>
          Information
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, color: "#ededed" }}>
          {score}
          <span style={{ fontSize: 18, fontWeight: 600, color: "#b0b0b0" }}>
            /100
          </span>
        </div>
        {narrative && (
          <div style={{ marginTop: 12, color: "#b0b0b0", lineHeight: 1.5, fontSize: 14 }}>
            {narrative}
          </div>
        )}
      </section>

      {/* Card 2: Top Fixes */}
      <section
        className={`info-card-${id}`}
        style={{
          background: "#1a1a1a",
          borderRadius: 12,
          padding: 16,
          minHeight: 120,
          border: "1px solid #333",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 16, color: "#ededed" }}>
          Information
        </div>
        <div style={{ fontWeight: 700, marginBottom: 8, color: "#ededed" }}>Top fixes</div>
        <ol style={{ marginTop: 8, paddingLeft: 18, fontSize: 14 }}>
          {topFixes.length ? (
            topFixes.map((fix, i) => (
              <li key={i} style={{ marginBottom: 8, color: "#b0b0b0" }}>
                {fix}
              </li>
            ))
          ) : (
            <li style={{ color: "#b0b0b0" }}>No major issues detected.</li>
          )}
        </ol>
      </section>

      {/* Card 3: Law Findings Summary */}
      <section
        className={`info-card-${id}`}
        style={{
          background: "#1a1a1a",
          borderRadius: 12,
          padding: 16,
          minHeight: 120,
          border: "1px solid #333",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 16, color: "#ededed" }}>
          Information
        </div>
        <div style={{ fontWeight: 700, marginBottom: 8, color: "#ededed" }}>
          Findings by law
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(laws).slice(0, 3).map(([key, item]) => {
            const tag = severityStyle(item.severity);
            return (
              <div
                key={key}
                style={{
                  padding: 8,
                  background: "#0a0a0a",
                  borderRadius: 6,
                  fontSize: 13,
                  border: "1px solid #333",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, color: "#ededed" }}>{item.title}</div>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 999,
                      border: `1px solid ${tag.borderColor}`,
                      background: tag.background,
                      color: tag.color,
                    }}
                  >
                    {item.severity}
                  </span>
                </div>
                <div style={{ marginTop: 4, color: "#b0b0b0", fontSize: 12 }}>
                  {item.finding}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
    </>
  );
}
