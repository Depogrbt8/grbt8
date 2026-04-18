import { GET } from '@/app/api/airports/search/route.ts';

describe('api/airports/search/route.ts', () => {
  it('should return empty array for short query', async () => {
    const request = new Request('http://localhost/api/airports/search?q=a');
    const response = await GET(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual([]);
  });

  it('should return static matches for IST', async () => {
    const request = new Request('http://localhost/api/airports/search?q=ist');
    const response = await GET(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data.some((a: { code: string }) => a.code === 'IST')).toBe(true);
  });
});
