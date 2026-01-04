"use client"; 
// Marks this as a client-side component (required for hooks, browser APIs, window, etc.)

import { useState } from "react";
import Link from "next/link";

export default function AnalyzePage() {
  // Holds the compressed base64 image for preview + API upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Used to prevent double submissions and show loading state
  const [isRunning, setIsRunning] = useState(false);

  // Stores any user-facing error message
  const [error, setError] = useState<string | null>(null);

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

  /**
   * Sends the image to the analysis API
   * Redirects to results page on success
   */
  async function runAnalysis() {
    // Prevent running without an image or while already running
    if (!imagePreview || isRunning) return;

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
        return;
      }

      // Redirect to results page using returned reportId
      window.location.href = `/results/${data.reportId}`;
    } catch (err: any) {
      // Handle network or unexpected errors
      setError(err?.message || "Network error");
    } finally {
      // Always clear loading state
      setIsRunning(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: 16,
        fontFamily: "system-ui",
        background: "#0a0a0a",
        color: "#ededed",
        minHeight: "100vh",
      }}
    >
      {/* Back navigation */}
      <Link href="/" style={{ color: "#4a9eff" }}>← Back</Link>

      {/* Page header */}
      <h1 style={{ fontSize: 28, marginTop: 16, marginBottom: 8, color: "#ededed" }}>
        Analyze
      </h1>

      <p style={{ marginTop: 0, color: "#b0b0b0" }}>
        Upload a screenshot and we'll analyze it using UX laws + ChatGPT.
      </p>

      {/* Image upload section */}
      <div style={{ marginTop: 20 }}>
        <label style={{ color: "#ededed" }}>
          <strong>Upload screenshot</strong>
          <br />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              marginTop: 8,
              color: "#ededed",
            }}
          />
        </label>

        {/* Image preview (only shown once uploaded) */}
        {imagePreview && (
          <div style={{ marginTop: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: "100%",
                border: "1px solid #333",
                borderRadius: 8,
              }}
            />
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            marginTop: 16,
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

      {/* Run analysis button */}
      <button
        style={{
          marginTop: 20,
          padding: "10px 16px",
          cursor: !imagePreview || isRunning ? "not-allowed" : "pointer",
          background: !imagePreview || isRunning ? "#333" : "#4a9eff",
          color: "#ededed",
          border: "none",
          borderRadius: 6,
          fontWeight: 500,
        }}
        onClick={runAnalysis}
        disabled={!imagePreview || isRunning}
      >
        {isRunning ? "Analyzing..." : "Run analysis"}
      </button>

      {/* Performance tip */}
      <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
        Tip: smaller screenshots analyze faster.
      </div>
    </main>
  );
}
