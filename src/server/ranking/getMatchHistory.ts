import { MATCH_REQUEST_DELAY_MS, sleep } from '@/server/http/sleep';
import { mapMatchDto } from '@/server/mappers/matchMapper';
import { fetchMatchById, fetchMatchIds } from '@/server/riot/matches';
import type { MatchSummary } from '@/types/match';

export async function getMatchHistory(params: {
  apiKey: string;
  puuid: string;
  region: string;
}): Promise<MatchSummary[]> {
  const matchIds = await fetchMatchIds(params.apiKey, params.puuid, params.region);
  if (!matchIds.length) return [];

  const matches: MatchSummary[] = [];

  for (const matchId of matchIds) {
    try {
      const matchData = await fetchMatchById(params.apiKey, matchId, params.region);
      if (matchData) {
        matches.push(mapMatchDto(matchId, matchData, params.puuid));
      }
    } catch (err) {
      console.error(`Erro ao buscar detalhes da partida ${matchId}:`, err);
    }
    await sleep(MATCH_REQUEST_DELAY_MS);
  }

  return matches;
}
