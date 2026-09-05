import Link from "next/link";
import { brandConfig } from "@/config/brand.config";

export default function NotFound() {
  const pink = "#FF1E7E";
  const ink = "#1A1620";
  const mute = "#6E6675";
  return (
    <div
      style={{
        background: "#FFF6FA",
        minHeight: "100vh",
        color: ink,
        fontFamily: "var(--font-body), sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: pink, marginBottom: 18 }}>
        {brandConfig.name}
      </div>
      <h1 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 500, fontSize: "clamp(30px,7vw,48px)", lineHeight: 1.05, margin: 0 }}>
        We couldn&apos;t find that <span style={{ fontStyle: "italic", color: pink }}>card</span>.
      </h1>
      <p style={{ color: mute, fontSize: 15, lineHeight: 1.6, maxWidth: 380, margin: "18px auto 28px" }}>
        The page you were looking for isn&apos;t here. Let&apos;s get you back to the cards.
      </p>
      <Link
        href="/cards"
        style={{
          background: pink,
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          padding: "12px 24px",
          borderRadius: 999,
          textDecoration: "none",
        }}
      >
        Back to all cards →
      </Link>
    </div>
  );
}
