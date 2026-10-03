/**
 * Decorative art for the Académie: the circular line (ring with stations)
 * and a 45° branch leaving it. Pure SVG, cropped by its container.
 */
export function AcademyArt({ className }: { className?: string }) {
  const stations = [-30, 30, 90, 150, 210, 270];
  const cx = 300;
  const cy = 300;
  const r = 210;
  return (
    <svg
      aria-hidden
      viewBox="0 0 640 600"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={cx} cy={cy} r={r} stroke="#fff" strokeOpacity="0.9" strokeWidth="14" />
      <circle cx={cx} cy={cy} r={r - 26} stroke="#fff" strokeOpacity="0.28" strokeWidth="6" />
      <path
        d={`M${cx + r} ${cy} H${cx + r + 50} l110 -110 H700`}
        stroke="#fff"
        strokeOpacity="0.9"
        strokeWidth="14"
      />
      {stations.map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <circle
            key={a}
            cx={cx + r * Math.cos(rad)}
            cy={cy + r * Math.sin(rad)}
            r="17"
            fill="#6d3be0"
            stroke="#fff"
            strokeWidth="8"
          />
        );
      })}
    </svg>
  );
}
