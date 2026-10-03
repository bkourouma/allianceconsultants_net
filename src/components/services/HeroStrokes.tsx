/** Decorative bundle of parallel strokes that bends at 45° (hero backdrop). */
export function HeroStrokes({
  colors,
  className,
}: {
  colors: string[];
  className?: string;
}) {
  const strokes = (colors.length ? colors : ["#ffffff"]).slice(0, 6);
  return (
    <svg
      aria-hidden
      viewBox="0 0 520 320"
      className={className}
      fill="none"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {strokes.map((c, i) => (
        <path
          key={i}
          d={`M540 ${60 + i * 16} H380 L230 ${210 + i * 16} H-20`}
          stroke={c}
        />
      ))}
      <circle cx="380" cy={60 + ((strokes.length - 1) * 16) / 2} r="17" fill="#07122b" stroke="#fff" strokeWidth="8" />
    </svg>
  );
}
