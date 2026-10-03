import styles from "./Arrival.module.css";

interface ArrivalProps {
  /** Colour of the train (a line colour). */
  color: string;
  /** Accent stripe colour. */
  stripe: string;
}

/**
 * A train glides into the terminus and stops against the buffer bar.
 * Pure CSS animation; reduced-motion shows the arrived state immediately.
 */
export function Arrival({ color, stripe }: ArrivalProps) {
  return (
    <div
      aria-hidden
      className="relative overflow-hidden bg-enamel"
    >
      <div className="relative h-28 sm:h-32">
        {/* rails */}
        <div className="absolute inset-x-0 bottom-5 grid gap-1">
          <span className="h-1.5 rounded-full" style={{ background: color }} />
          <span className="h-1.5 rounded-full" style={{ background: stripe }} />
        </div>

        <div className="wrap relative h-full">
          {/* buffer bar + terminus sign */}
          <span className="absolute bottom-3 right-[clamp(1rem,4vw,2.5rem)] h-20 w-2.5 rounded-[3px] bg-ink sm:h-24" />
          <span
            className={`${styles.sign} absolute bottom-[5.75rem] right-[clamp(1.5rem,5vw,3rem)] hidden rounded-[4px] bg-ink px-3 py-1 text-xs font-bold tracking-wide text-white sm:block`}
          >
            Terminus
          </span>

          <div
            className={`${styles.train} absolute bottom-[1.4rem] right-[calc(clamp(1rem,4vw,2.5rem)+1.25rem)]`}
          >
            <svg
              viewBox="0 0 300 72"
              className="h-16 w-auto sm:h-[4.5rem]"
              focusable="false"
            >
              <path
                d="M8 56 V18 Q8 8 18 8 H240 L280 48 V56 Z"
                fill={color}
              />
              <rect x="8" y="44" width="272" height="6" fill={stripe} />
              {[24, 78, 132, 186].map((x) => (
                <rect
                  key={x}
                  x={x}
                  y="18"
                  width="40"
                  height="20"
                  rx="3"
                  fill="#ffffff"
                  className={styles.windows}
                />
              ))}
              <path d="M232 18 H244 L262 38 H232 Z" fill="#ffffff" className={styles.windows} />
              {[48, 104, 200, 250].map((x) => (
                <circle key={x} cx={x} cy="60" r="7" fill="#0b1b3a" />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
