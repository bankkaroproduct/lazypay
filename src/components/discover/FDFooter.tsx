"use client";

import { brandConfig } from "@/config/brand.config";
import { T, cap } from "./theme";

/**
 * Footer for the FD journey: support email, "Powered by BankKaro" and the
 * Pouring Pound legal line. No links to the parked screens.
 * `padBottom` clears a fixed bar (the detail page's Apply bar) below it.
 */
export function FDFooter({ padBottom = 0 }: { padBottom?: number }) {
  return (
    <footer
      style={{
        borderTop: `1px solid ${T.line}`,
        padding: `22px 4px ${22 + padBottom}px`,
        marginTop: 28,
        textAlign: "center",
        color: T.mute,
        fontSize: 12.5,
        lineHeight: 1.6,
      }}
    >
      <div style={cap}>Support</div>
      <a href={`mailto:${brandConfig.email}`} style={{ display: "inline-block", marginTop: 4, color: T.pink, fontWeight: 600, textDecoration: "none" }}>
        {brandConfig.email}
      </a>

      <div className="flex items-center justify-center" style={{ gap: 8, marginTop: 18 }}>
        <span style={cap}>Powered by</span>
        {/* The artwork is all-white (made for dark footers); brightness(0) renders it black here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/bankkaro-powered.svg" alt="BankKaro" style={{ height: 16, width: "auto", filter: "brightness(0)", opacity: 0.85 }} />
      </div>

      <div style={{ marginTop: 14, fontSize: 11.5, color: T.faint }}>
        © {new Date().getFullYear()} Pouring Pound India Private Limited. All rights reserved.
      </div>
    </footer>
  );
}
