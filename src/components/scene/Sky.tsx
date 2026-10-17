/**
 * Sky: soft gradient from warm sky blue to paper, with a static sun bloom.
 * CSS-only — never uses Motion, so it renders before JS loads.
 */
export function Sky() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #CFE4EC 0%, #E8F4F8 35%, #FBF5EC 70%)",
        }}
      />
      {/* Sun bloom — static radial gradient */}
      <div
        className="absolute"
        style={{
          top: -60,
          left: -40,
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,243,224,0.80) 0%, rgba(255,243,224,0.25) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
