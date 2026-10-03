import { LINES } from "@/lib/network";

/**
 * Decorative hero art for /services: the six solution lines converge at 45°
 * into the single ink "correspondance" line that the page follows.
 */
export function ServicesHeroArt({ className }: { className?: string }) {
  const n = LINES.length;
  return (
    <svg
      aria-hidden
      viewBox="0 0 420 460"
      className={className}
      fill="none"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {LINES.map((l, i) => {
        const x = 40 + i * 44;
        // each line comes down vertically, bends 45° towards x=332 and merges
        const dx = 332 - x;
        const yBend = 70 + i * 22;
        return (
          <path
            key={l.id}
            d={`M${x} -10 V${yBend} l${dx} ${Math.abs(dx)} V470`}
            stroke={l.color}
            opacity={0.95}
          />
        );
      })}
      <path d="M332 0 V470" stroke="#0b1b3a" strokeWidth="14" />
      {Array.from({ length: 3 }).map((_, i) => (
        <circle
          key={i}
          cx="332"
          cy={250 + i * 90}
          r="17"
          fill="#fff"
          stroke="#0b1b3a"
          strokeWidth="9"
        />
      ))}
      <title>{`${n} lignes de solutions`}</title>
    </svg>
  );
}
