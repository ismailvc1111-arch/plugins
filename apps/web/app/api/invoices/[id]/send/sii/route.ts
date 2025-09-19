import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
  const token = process.env.STRAPI_API_TOKEN;
  const response = await fetch(`${strapiUrl}/aeat/sii/send/${params.id}`, {
    method: 'POST',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to enqueue SII' }, { status: response.status });
  }
  return NextResponse.json(await response.json());
}
