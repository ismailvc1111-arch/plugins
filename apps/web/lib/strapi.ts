import 'server-only';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (STRAPI_TOKEN) {
    headers.set('Authorization', `Bearer ${STRAPI_TOKEN}`);
  }
  const res = await fetch(`${STRAPI_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Strapi error ${res.status}`);
  }
  return res.json();
}

export const strapi = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};

export function unwrapCollection<T>(response: { data: { id: number; attributes: T }[] }): (T & { id: number })[] {
  return response.data.map((item) => ({ id: item.id, ...item.attributes }));
}

export function unwrapEntity<T>(response: { data: { id: number; attributes: T } }): T & { id: number } {
  return { id: response.data.id, ...response.data.attributes };
}
