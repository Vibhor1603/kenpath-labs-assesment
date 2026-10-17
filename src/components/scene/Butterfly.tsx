/**
 * Butterfly: a small SVG butterfly that crosses the scene every 12-20s.
 * Uses CSS animation only (runs off the main thread).
 * Hidden in reduced motion and lite mode (data-lite on <html>).
 */
export function Butterfly() {
  return (
    <div
      className="butterfly-wrap absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <style>{`
        .butterfly-wrap {
          /* Hidden by default; shown only in full mode */
        }
        [data-lite] .butterfly-wrap,
        [data-calm] .butterfly-wrap {
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .butterfly-wrap { display: none; }
        }
        @keyframes butterfly-fly {
          0%   { transform: translate(-40px, 60%) scaleX(1); opacity: 0; }
          5%   { opacity: 1; }
          50%  { transform: translate(50%, 40%) scaleX(1); }
          95%  { opacity: 1; }
          100% { transform: translate(calc(100vw + 40px), 55%) scaleX(1); opacity: 0; }
        }
        @keyframes butterfly-wings {
          0%, 100% { transform: scaleY(1); }
          50%       { transform: scaleY(0.3); }
        }
        .butterfly-body {
          animation: butterfly-fly 4s cubic-bezier(0.45, 0, 0.55, 1) forwards;
          animation-delay: var(--delay, 14s);
          animation-iteration-count: infinite;
          animation-duration: 4s;
        }
        .butterfly-wing {
          animation: butterfly-wings 0.25s ease-in-out infinite alternate;
          transform-origin: center;
        }
      `}</style>
      <div
        className="butterfly-body absolute top-0 left-0"
        style={{ "--delay": "14s" } as React.CSSProperties}
      >
        <svg width="24" height="16" viewBox="0 0 24 16">
          <g className="butterfly-wing">
            <ellipse cx="7" cy="8" rx="7" ry="5" fill="#D9D0EE" opacity="0.85" />
            <ellipse cx="17" cy="8" rx="7" ry="5" fill="#C9DDB8" opacity="0.85" />
          </g>
          <ellipse cx="12" cy="8" rx="1.5" ry="5" fill="#5E554D" />
        </svg>
      </div>
    </div>
  );
}
