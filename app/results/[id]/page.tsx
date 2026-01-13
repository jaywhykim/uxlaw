import Link from "next/link";
import { prisma } from "@/lib/prisma";
import UploadButton from "./UploadButton";

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

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const report = await prisma.report.findUnique({ where: { id } });

  if (!report) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui", background: "#0a0a0a", color: "#ededed", minHeight: "100vh" }}>
        <Link href="/" style={{ color: "#4a9eff" }}>← Back</Link>
        <h1 style={{ marginTop: 16, color: "#ededed" }}>Report not found</h1>
      </main>
    );
  }

  const topFixes = (report.topFixes as string[]) ?? [];

  // laws JSON now contains: narrative + the law objects
  const lawsAll = (report.laws as Record<string, any>) ?? {};
  const narrative =
    typeof lawsAll.narrative === "string" ? (lawsAll.narrative as string) : "";

  // Remove narrative from the law cards
  const lawEntries = Object.entries(lawsAll).filter(([key]) => key !== "narrative");
  const laws = Object.fromEntries(lawEntries) as Record<string, LawFinding>;

  return (
    <>
      <style suppressHydrationWarning dangerouslySetInnerHTML={{
        __html: `
          .results-container-${id} {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            align-items: start;
          }
          
          .info-cards-container-${id} {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          @media (max-width: 768px) {
            .results-container-${id} {
              display: flex;
              flex-direction: column;
            }
            
            .info-cards-container-${id} {
              display: flex;
              flex-direction: column;
              gap: 16px;
              margin-top: 24px;
            }
            
            .info-card-${id} {
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
        <div style={{ marginBottom: 24 }}>
          <Link href="/" style={{ color: "#4a9eff" }}>← Back</Link>
        </div>

        <div className={`results-container-${id}`}>
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
              <UploadButton />
            </div>
            
            {/* Screenshot */}
            <div style={{
              width: "100%",
              maxHeight: "400px",
              overflow: "hidden",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0a0a0a",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={report.imageDataUrl}
                alt="Uploaded screenshot"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "400px",
                  objectFit: "contain",
                  borderRadius: 4,
                }}
              />
            </div>
          </section>

          {/* Right: Information cards - Desktop view */}
          <div className={`info-cards-container-${id}`}>
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
              {report.score}
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
        </div>
    </main>
    </>
  );
}
