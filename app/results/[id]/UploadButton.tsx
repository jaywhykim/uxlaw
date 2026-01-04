"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        const MAX_W = 1200;
        const scale = Math.min(1, MAX_W / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.75);

        // Run analysis
        runAnalysis(compressed);
      };

      img.onerror = () => {};
      img.src = reader.result as string;
    };

    reader.onerror = () => {};
    reader.readAsDataURL(file);
  }

  async function runAnalysis(imageDataUrl: string) {
    setIsRunning(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: imageDataUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Analysis failed");
        setIsRunning(false);
        return;
      }

      // Redirect to new results page
      router.push(`/results/${data.reportId}`);
    } catch (err: any) {
      alert(err?.message || "Network error");
      setIsRunning(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .button-spinner {
            border: 2px solid #ccc;
            border-top: 2px solid #666;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            animation: spin 1s linear infinite;
          }
        `
      }} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{
          position: "absolute",
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
        disabled={isRunning}
      />
      <div
        onClick={() => {
          if (!isRunning) {
            fileInputRef.current?.click();
          }
        }}
        style={{
          padding: "12px 24px",
          background: isRunning ? "#e0e0e0" : "#f0f0f0",
          border: "1px solid #333",
          borderRadius: 999,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: isRunning ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          opacity: isRunning ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isRunning) {
            e.currentTarget.style.background = "#e0e0e0";
          }
        }}
        onMouseLeave={(e) => {
          if (!isRunning) {
            e.currentTarget.style.background = "#f0f0f0";
          }
        }}
      >
        {isRunning ? (
          <>
            <div className="button-spinner"></div>
            <span
              style={{
                fontSize: 16,
                color: "#333",
                fontWeight: 500,
              }}
            >
              Analyzing...
            </span>
          </>
        ) : (
          <>
            <span
              style={{
                fontSize: 20,
                color: "#666",
                fontWeight: 300,
                lineHeight: 1,
              }}
            >
              +
            </span>
            <span
              style={{
                fontSize: 16,
                color: "#333",
                fontWeight: 500,
              }}
            >
              Upload screenshot
            </span>
          </>
        )}
      </div>
    </>
  );
}
