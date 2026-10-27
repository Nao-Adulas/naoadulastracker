import { regionalUrl, riotGet } from '@/server/riot/client';

export async function fetchMatchIds(
  apiKey: string,
  puuid: string,
  region: string,
  count = 10
): Promise<string[]> {
  const url = regionalUrl(region, `/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`);
  const { ok, status, data } = await riotGet<string[]>(url, apiKey);
  if (!ok || !data) {
    throw new Error(`Erro ao buscar IDs de partidas (${status})`);
  }
  return data;
}

export async function fetchMatchById(
  apiKey: string,
  matchId: string,
  region: string
): Promise<any | null> {
  const url = regionalUrl(region, `/lol/match/v5/matches/${matchId}`);
  const { ok, data } = await riotGet<any>(url, apiKey);
  return ok ? data : null;
}
