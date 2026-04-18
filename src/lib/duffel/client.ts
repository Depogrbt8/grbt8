const DUFFEL_API_BASE = 'https://api.duffel.com';

export function requireDuffelToken(): string {
  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error('DUFFEL_ACCESS_TOKEN is not configured');
  }
  return token;
}

export async function duffelFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = requireDuffelToken();
  const url = path.startsWith('http')
    ? path
    : `${DUFFEL_API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  return fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      'Duffel-Version': 'v2',
      ...init?.headers,
    },
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
