import { businessOutboxStatus } from '@/lib/seo-business-outbox.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const status = await businessOutboxStatus(request.headers.get('authorization'));
  if (!status) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  return Response.json(status, { headers: { 'Cache-Control': 'no-store' } });
}
