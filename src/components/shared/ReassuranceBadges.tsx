interface ReassuranceBadgesProps {
  badges: string[];
}

export function ReassuranceBadges({ badges }: ReassuranceBadgesProps) {
  return (
    <div
      className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      aria-label="Points forts Alliance Consultants"
    >
      {badges.map((badge) => (
        <span
          key={badge}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm sm:text-sm"
        >
          <span
            aria-hidden="true"
            className="inline-block size-1.5 shrink-0 rounded-full bg-accent"
          />
          {badge}
        </span>
      ))}
    </div>
  );
}
