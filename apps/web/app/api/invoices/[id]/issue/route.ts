import { NextResponse } from 'next/server';
import { strapi } from '@/lib/strapi';

export const runtime = 'nodejs';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const response = await strapi.put(`/api/invoices/${params.id}`, {
    data: {
      status: 'issued',
    },
  });
  return NextResponse.json(response);
}
