interface ReassuranceBadgesProps {
  badges: string[];
}

export function ReassuranceBadges({ badges }: ReassuranceBadgesProps) {
  return (
    <div className="mt-10 flex flex-wrap justify-center gap-3" aria-label="Points forts Alliance Consultants">
      {badges.map((badge) => (
        <span
          key={badge}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
          {badge}
        </span>
      ))}
    </div>
  );
}
