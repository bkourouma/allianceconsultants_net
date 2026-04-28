import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Alliance Consultants — Solutions SaaS & IA pour l'Afrique";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f172a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#60a5fa",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Alliance Consultants
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            maxWidth: 800,
            marginBottom: 32,
          }}
        >
          Solutions SaaS & IA pour les organisations africaines
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#94a3b8",
            lineHeight: 1.5,
            maxWidth: 700,
          }}
        >
          Éditeur africain depuis 2003 — GED, pharma, immobilier, santé, formations
        </div>
        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 60,
            width: 200,
            height: 4,
            background: "#1d4ed8",
            borderRadius: 2,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
