import { NextResponse } from 'next/server';
import { strapi } from '@/lib/strapi';

export async function POST(request: Request) {
  const body = await request.json();
  const response = await strapi.post('/api/invoices', body);
  return NextResponse.json(response);
}
