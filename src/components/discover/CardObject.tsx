"use client";

import type { Card } from "@/lib/publicCards";

/** The angled card artwork, drawn from each card's own gradient + image. */
export function CardObject({
  card,
  size = "sm",
}: {
  card: Card;
  size?: "sm" | "xs" | "mini" | "hero";
}) {
  const dims =
    size === "hero"
      ? { w: "100%", h: undefined as any, r: 20, aspect: 1.585 }
      : size === "mini"
      ? { w: 58, h: 37, r: 7, aspect: undefined }
      : size === "xs"
      ? { w: 54, h: 34, r: 6, aspect: undefined }
      : { w: 74, h: 47, r: 8, aspect: undefined };
  return (
    <div
      style={{
        width: dims.w,
        height: dims.h,
        aspectRatio: dims.aspect ? String(dims.aspect) : undefined,
        maxWidth: size === "hero" ? 360 : undefined,
        borderRadius: dims.r,
        background: card.gradient,
        boxShadow:
          size === "hero"
            ? "0 40px 80px -30px rgba(20,10,25,0.16), inset 0 1px 0 rgba(255,255,255,0.14)"
            : "0 8px 18px -8px rgba(20,10,25,0.14), inset 0 1px 0 rgba(255,255,255,0.12)",
        position: "relative",
        overflow: "hidden",
        flex: "none",
      }}
    >
      {card.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.image}
          alt={card.name}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(115deg, rgba(255,255,255,0.18) 0%, transparent 42%)",
        }}
      />
    </div>
  );
}

export function Stars({ value, color = "#FF1E7E" }: { value: number; color?: string }) {
  const n = Math.round(value);
  return (
    <span style={{ color, letterSpacing: "1px", fontSize: 11 }}>
      {"★".repeat(n)}
      <span style={{ color: "#D9D2DE" }}>{"★".repeat(Math.max(0, 5 - n))}</span>
    </span>
  );
}
