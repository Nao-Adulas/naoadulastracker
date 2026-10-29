import { fetchMatchSummaries } from '@/server/ranking/getMatchHistory';
import { getCachedMatches, getCachedMatchIds, saveMatches } from '@/server/ranking/matchCache';
import { fetchMatchIds } from '@/server/riot/matches';
import type { MatchSummary } from '@/types/match';

/**
 * Busca os IDs das últimas partidas na Riot, baixa só as que ainda não estão
 * no Supabase, salva e devolve o histórico atualizado a partir do banco.
 */
export async function syncPlayerMatches(params: {
  apiKey: string;
  puuid: string;
  region: string;
}): Promise<MatchSummary[]> {
  const { apiKey, puuid, region } = params;

  const matchIds = await fetchMatchIds(apiKey, puuid, region);
  const cachedIds = await getCachedMatchIds(puuid, matchIds);
  const missingIds = matchIds.filter((id) => !cachedIds.has(id));

  const fresh = await fetchMatchSummaries({ apiKey, puuid, region, matchIds: missingIds });
  await saveMatches(puuid, fresh);

  return getCachedMatches(puuid);
}