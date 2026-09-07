import { T } from "./theme";

/** Shown instantly on navigation while a route's server data is still loading. */
export default function PageLoading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
      <div
        style={{
          width: 34, height: 34, borderRadius: "50%",
          border: `3px solid ${T.line}`, borderTopColor: T.pink,
          animation: "page-loading-spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes page-loading-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
