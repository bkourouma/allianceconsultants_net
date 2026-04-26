type EventCategory = "Hero" | "Solutions" | "IA" | "Services" | "Trainings" | "FinalCTA" | "Engagement";

export function trackEvent(
  category: EventCategory,
  action: string,
  name?: string,
  value?: number
): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((window as any)._paq ||= []).push(["trackEvent", category, action, name, value]);
}
