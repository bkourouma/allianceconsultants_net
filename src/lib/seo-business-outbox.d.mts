export interface SubmissionDimensions {
  pagePath?: string;
  language?: string;
  device?: 'MOBILE' | 'DESKTOP' | 'TABLET';
}
export interface BusinessOutbox {
  prepare(dimensions?: SubmissionDimensions): Promise<string | null>;
  confirm(ticket: string | null, durableEventId?: string): Promise<boolean>;
  abandon(ticket: string | null): Promise<void>;
  flush(): Promise<{ sent: number }>;
  status(): Promise<Record<string, unknown>>;
}
export function submissionDimensions(input?: SubmissionDimensions): SubmissionDimensions;
export function submissionDevice(userAgent: string | null): SubmissionDimensions['device'];
export function createBusinessOutbox(options: { directory: string; sourceId: string; token: string; fetch?: typeof fetch; now?: () => Date }): BusinessOutbox;
export function startBusinessOutbox(): void;
export function prepareBusinessSubmission(input?: SubmissionDimensions): Promise<string | null>;
export function confirmBusinessSubmission(ticket: string | null, eventId?: string): Promise<boolean>;
export function abandonBusinessSubmission(ticket: string | null): Promise<void>;
export function businessOutboxStatus(authorization: string | null): Promise<Record<string, unknown> | null>;
