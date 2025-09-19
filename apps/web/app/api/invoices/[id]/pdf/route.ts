import { NextResponse } from 'next/server';
import { strapi } from '@/lib/strapi';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const response = await strapi.get<{ data: { pdfUrl?: string | null } }>(`/api/invoices/${params.id}`);
  const url = response.data.pdfUrl;
  if (!url) {
    return NextResponse.json({ error: 'PDF not ready' }, { status: 404 });
  }
  const absolute = new URL(url, process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337');
  return NextResponse.redirect(absolute);
}
