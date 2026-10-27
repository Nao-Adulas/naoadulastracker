import type { MatchesResponse } from '@/types/match';

export async function fetchPlayerMatches(
  puuid: string,
  region = 'americas'
): Promise<MatchesResponse> {
  const res = await fetch(`/api/matches?puuid=${encodeURIComponent(puuid)}&region=${region}`);
  if (!res.ok) {
    throw new Error('Não foi possível carregar o histórico de partidas');
  }
  return res.json();
}
