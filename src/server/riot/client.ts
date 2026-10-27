export async function riotGet<T>(url: string, apiKey: string): Promise<{
  ok: boolean;
  status: number;
  data: T | null;
}> {
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': apiKey },
  });

  if (!res.ok) {
    return { ok: false, status: res.status, data: null };
  }

  return { ok: true, status: res.status, data: (await res.json()) as T };
}

export function regionalUrl(region: string, path: string): string {
  return `https://${region}.api.riotgames.com${path}`;
}

export function platformUrl(platform: string, path: string): string {
  return `https://${platform}.api.riotgames.com${path}`;
}
