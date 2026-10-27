import { platformUrl, riotGet } from '@/server/riot/client';

export interface LeagueEntryDto {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

export async function fetchLeagueEntries(
  apiKey: string,
  puuid: string,
  platform: string
): Promise<{ ok: boolean; status: number; entries: LeagueEntryDto[] }> {
  const url = platformUrl(platform, `/lol/league/v4/entries/by-puuid/${puuid}`);
  const { ok, status, data } = await riotGet<LeagueEntryDto[]>(url, apiKey);

  return {
    ok,
    status,
    entries: ok && Array.isArray(data) ? data : [],
  };
}

export function findSoloQueueEntry(entries: LeagueEntryDto[]): LeagueEntryDto | null {
  return entries.find((entry) => entry.queueType === 'RANKED_SOLO_5x5') || null;
}
