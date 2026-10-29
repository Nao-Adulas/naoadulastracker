import type { MatchesResponse } from '@/types/match';

function matchesUrl(puuid: string, region: string): string {
  return `/api/matches?puuid=${encodeURIComponent(puuid)}&region=${region}`;
}

// Cache first: o servidor responde com o que está no Supabase (ou busca na Riot se estiver vazio).
export async function fetchPlayerMatches(
  puuid: string,
  region = 'americas'
): Promise<MatchesResponse> {
  const res = await fetch(matchesUrl(puuid, region));
  if (!res.ok) {
    throw new Error('Não foi possível carregar o histórico de partidas');
  }
  return res.json();
}

// Força a busca na Riot, salva as partidas novas no Supabase e devolve o histórico atualizado.
export async function refreshPlayerMatches(
  puuid: string,
  region = 'americas'
): Promise<MatchesResponse> {
  const res = await fetch(matchesUrl(puuid, region), { method: 'POST' });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || 'Não foi possível atualizar o histórico');
  }
  return res.json();
}