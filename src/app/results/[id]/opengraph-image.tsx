import { ImageResponse } from "next/og";
import { LOGO_BASE64 } from "@/lib/logo-base64";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Glasswork Analysis Results";

const TIER_CONFIG: Record<string, { label: string; bg: string; border: string; score: string; labelBg: string; labelText: string }> = {
  carry: { label: "LOCKED IN", bg: "rgba(81,139,219,0.12)", border: "rgba(81,139,219,0.30)", score: "#518BDB", labelBg: "rgba(81,139,219,0.15)", labelText: "#7FB3F5" },
  solid: { label: "MID", bg: "rgba(54,186,184,0.10)", border: "rgba(54,186,184,0.25)", score: "#36BAB8", labelBg: "rgba(54,186,184,0.12)", labelText: "#36BAB8" },
  ghost: { label: "SELLING", bg: "rgba(229,160,87,0.10)", border: "rgba(229,160,87,0.25)", score: "#E5A057", labelBg: "rgba(229,160,87,0.12)", labelText: "#E5A057" },
};

interface OGData {
  title: string;
  sourceType?: string;
  summary?: string | null;
  contributors: Array<{ name: string; score: number; tier: string }>;
}

export default async function Image({ params }: { params: { id: string } }) {
  let data: OGData = { title: "Glasswork Analysis", contributors: [] };

  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      const siteUrl = convexUrl.replace(".cloud", ".site");
      const res = await fetch(`${siteUrl}/analysis-og?id=${params.id}`, {
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        data = await res.json();
      }
    }
  } catch {
    // Use fallback data
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#111113",
          padding: "56px 60px",
          fontFamily: "Inter, system-ui, sans-serif",
          gap: "0px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_BASE64}
            alt="Glasswork"
            width={36}
            height={36}
            style={{ borderRadius: "10px", objectFit: "contain" }}
          />
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#F2F2F2", letterSpacing: "-0.02em" }}>
            glass<span style={{ color: "#518BDB" }}>work</span>
          </span>
          {data.sourceType && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#828282",
                background: "rgba(255,255,255,0.06)",
                padding: "3px 10px",
                borderRadius: "100px",
                marginLeft: "4px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {data.sourceType === "google_doc" ? "Google Doc" : "GitHub Repo"}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "38px",
          fontWeight: 800,
          color: "#F2F2F2",
          lineHeight: 1.1,
          margin: "0 0 12px 0",
          letterSpacing: "-0.025em",
          maxWidth: "900px",
        }}>
          {data.title.length > 60 ? data.title.slice(0, 60) + "..." : data.title}
        </h1>

        {/* AI Summary */}
        {data.summary && (
          <p style={{
            fontSize: "17px",
            color: "#828282",
            lineHeight: 1.5,
            margin: "0 0 48px 0",
            maxWidth: "780px",
          }}>
            {data.summary.length > 130 ? data.summary.slice(0, 130) + "..." : data.summary}
          </p>
        )}

        {/* Contributor tier cards */}
        {data.contributors.length > 0 && (
          <div style={{ display: "flex", gap: "20px", marginTop: "auto" }}>
            {data.contributors.map((c, i) => {
              const tc = TIER_CONFIG[c.tier] ?? TIER_CONFIG.solid;
              return (
                <div key={i} style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "24px 28px",
                  borderRadius: "18px",
                  background: tc.bg,
                  border: `1px solid ${tc.border}`,
                  minWidth: "180px",
                  flex: 1,
                  maxWidth: "260px",
                }}>
                  <span style={{ fontSize: "52px", fontWeight: 900, color: tc.score, lineHeight: 1, letterSpacing: "-0.04em" }}>
                    {c.score}
                  </span>
                  <span style={{ fontSize: "17px", fontWeight: 600, color: "#F2F2F2", letterSpacing: "-0.01em" }}>
                    {c.name.length > 16 ? c.name.slice(0, 16) + "..." : c.name}
                  </span>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    color: tc.labelText,
                    background: tc.labelBg,
                    padding: "4px 10px",
                    borderRadius: "100px",
                    width: "fit-content",
                  }}>
                    {tc.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom watermark */}
        <div style={{
          position: "absolute",
          bottom: "32px",
          right: "48px",
          fontSize: "13px",
          color: "rgba(255,255,255,0.20)",
          fontWeight: 500,
        }}>
          glasswork.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
