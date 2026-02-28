import { ImageResponse } from "next/og";
import { LOGO_BASE64 } from "@/lib/logo-base64";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Glasswork Analysis Results";

const TIER_CONFIG: Record<string, { label: string; bg: string; fg: string }> = {
  carry: { label: "LOCKED IN", bg: "#111111", fg: "#ffffff" },
  solid: { label: "MID", bg: "#E5E5E5", fg: "#404040" },
  ghost: { label: "SELLING", bg: "#F5F5F5", fg: "#A3A3A3" },
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
          justifyContent: "space-between",
          padding: "60px",
          background: "linear-gradient(135deg, #FAFAF8 0%, #F0EDFF 50%, #FAFAF8 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO_BASE64}
            alt="Glasswork"
            width={44}
            height={44}
            style={{ borderRadius: "10px", objectFit: "contain" }}
          />
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#111111" }}>
            Glasswork
          </span>
          {data.sourceType && (
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: data.sourceType === "google_doc" ? "#6C63FF" : "#2DA44E",
                background:
                  data.sourceType === "google_doc"
                    ? "rgba(108, 99, 255, 0.1)"
                    : "rgba(45, 164, 78, 0.1)",
                padding: "4px 12px",
                borderRadius: "100px",
              }}
            >
              {data.sourceType === "google_doc" ? "Google Doc" : "GitHub Repo"}
            </span>
          )}
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1
            style={{
              fontSize: "42px",
              fontWeight: 800,
              color: "#111111",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {data.title}
          </h1>
          {data.summary && (
            <p
              style={{
                fontSize: "18px",
                color: "#555555",
                lineHeight: 1.4,
                margin: 0,
                maxWidth: "800px",
              }}
            >
              {data.summary.length > 120
                ? data.summary.slice(0, 120) + "..."
                : data.summary}
            </p>
          )}
        </div>

        {/* Contributors */}
        {data.contributors.length > 0 && (
          <div style={{ display: "flex", gap: "24px" }}>
            {data.contributors.map((c, i) => {
              const tier = TIER_CONFIG[c.tier] ?? TIER_CONFIG.solid;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    padding: "24px 32px",
                    borderRadius: "20px",
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.6)",
                    minWidth: "160px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "48px",
                      fontWeight: 800,
                      color: "#111111",
                      lineHeight: 1,
                    }}
                  >
                    {c.score}
                  </span>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#555555",
                    }}
                  >
                    {c.name.length > 14 ? c.name.slice(0, 14) + "..." : c.name}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      color: tier.fg,
                      background: tier.bg,
                      padding: "4px 10px",
                      borderRadius: "100px",
                    }}
                  >
                    {tier.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}
