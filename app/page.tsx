"use client"; 

import { useState, useRef, useEffect } from "react";

export default function HomePage() {
  // Holds the compressed base64 image for preview + API upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Used to prevent double submissions and show loading state
  const [isRunning, setIsRunning] = useState(false);

  // Stores any user-facing error message
  const [error, setError] = useState<string | null>(null);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles image upload from file input
   * - Reads the file
   * - Resizes it in the browser
   * - Compresses it to JPEG
   * - Stores as base64 for preview + API usage
   */
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    // Clear previous errors when a new file is selected
    setError(null);

    // Grab the first uploaded file
    const file = e.target.files?.[0];
    if (!file) return;

    // Create browser helpers for reading + rendering the image
    const img = new Image();
    const reader = new FileReader();

    // When FileReader finishes reading the file
    reader.onload = () => {
      // When the Image object finishes loading the base64
      img.onload = () => {
        // Max width to prevent huge payloads
        const MAX_W = 1200;

        // Scale down only if image is larger than MAX_W
        const scale = Math.min(1, MAX_W / img.width);

        // Calculate resized dimensions
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        // Create an offscreen canvas for resizing/compression
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setError("Could not read image.");
          return;
        }

        // Draw the resized image into the canvas
        ctx.drawImage(img, 0, 0, w, h);

        // Convert canvas to compressed JPEG (smaller than PNG)
        // Quality 0.75 is a good balance of size vs clarity
        const compressed = canvas.toDataURL("image/jpeg", 0.75);

        // Save base64 image for preview + API submission
        setImagePreview(compressed);
      };

      // Handle unsupported or corrupted image files
      img.onerror = () => setError("Unsupported image file.");

      // Assign base64 string to Image src
      img.src = reader.result as string;
    };

    // Handle file read errors
    reader.onerror = () => setError("Failed to read file.");

    // Start reading file as base64
    reader.readAsDataURL(file);
  }

  // Automatically run analysis when image is uploaded
  useEffect(() => {
    if (imagePreview && !isRunning) {
      const analyze = async () => {
        setError(null);
        setIsRunning(true);

        try {
          // POST compressed image to API
          const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageDataUrl: imagePreview,
            }),
          });

          // Parse JSON response
          const data = await res.json();

          // Handle API-level errors
          if (!res.ok) {
            setError(data?.error || "Analysis failed");
            setIsRunning(false);
            return;
          }

          // Redirect to results page using returned reportId
          window.location.href = `/results/${data.reportId}`;
        } catch (err: any) {
          // Handle network or unexpected errors
          setError(err?.message || "Network error");
          setIsRunning(false);
        }
      };
      analyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePreview]);

  const uniqueId = "homepage";

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .results-container-${uniqueId} {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            align-items: start;
          }
          
          .info-cards-container-${uniqueId} {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          @media (max-width: 768px) {
            .results-container-${uniqueId} {
              display: flex;
              flex-direction: column;
            }
            
            .info-cards-container-${uniqueId} {
              display: flex;
              flex-direction: column;
              gap: 16px;
              margin-top: 24px;
            }
            
            .info-card-${uniqueId} {
              width: 100%;
            }
          }
        `
      }} />
    <main
      style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px",
        fontFamily: "system-ui",
          background: "#0a0a0a",
          color: "#ededed",
          minHeight: "100vh",
      }}
    >
        <div className={`results-container-${uniqueId}`}>
          {/* Left: Content with heading, description, and screenshot */}
          <section>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, color: "#ededed" }}>
              Get instant UX feedback that improves conversion
      </h1>
            <p style={{ fontSize: 16, color: "#b0b0b0", marginBottom: 32, lineHeight: 1.5 }}>
              Upload a screenshot and get an AI-powered UX audit grounded in proven UX laws.
            </p>
            
            {/* Upload button */}
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 32 }}>
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
            </div>

            {/* Image preview when uploaded */}
            {imagePreview && (
              <div style={{ marginTop: 24, position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 4,
                  }}
                />
              </div>
            )}
          </section>

          {/* Right: Three placeholder information cards */}
          <div className={`info-cards-container-${uniqueId}`}>
            <section
              className={`info-card-${uniqueId}`}
              style={{
                background: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                minHeight: 120,
                border: "1px solid #333",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#333",
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontWeight: 600, fontSize: 16, color: "#ededed" }}>
                  AI UX Audit
                </div>
              </div>
              <div style={{ fontSize: 14, color: "#b0b0b0", lineHeight: 1.5 }}>
                Upload a screenshot of your page and get an instant UX audit focused on conversion
              </div>
            </section>
            <section
              className={`info-card-${uniqueId}`}
              style={{
                background: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                minHeight: 120,
                border: "1px solid #333",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    background: "#333",
                    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontWeight: 600, fontSize: 16, color: "#ededed" }}>
                  Grounded in UX Laws
                </div>
              </div>
              <div style={{ fontSize: 14, color: "#b0b0b0", lineHeight: 1.5 }}>
                Insights are tied to well-known UX laws that explain why users hesitate, get confused, or drop off
              </div>
            </section>
            <section
              className={`info-card-${uniqueId}`}
              style={{
                background: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                minHeight: 120,
                border: "1px solid #333",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    background: "#333",
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontWeight: 600, fontSize: 16, color: "#ededed" }}>
                  Clear, Actionable Fixes
                </div>
              </div>
              <div style={{ fontSize: 14, color: "#b0b0b0", lineHeight: 1.5 }}>
                Get a conversion score, expert summary, and the most important changes to make
              </div>
            </section>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div
            style={{
              marginTop: 24,
              padding: 12,
              border: "1px solid #ff6b6b",
              background: "#2a1a1a",
              borderRadius: 8,
              color: "#ff8a8a",
            }}
          >
            <b>Error:</b> {error}
          </div>
        )}
    </main>

    </>
  );
}