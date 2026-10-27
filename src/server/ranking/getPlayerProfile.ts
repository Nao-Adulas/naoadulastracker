import { DELAY_BETWEEN_REQUESTS_MS, sleep } from '@/server/http/sleep';
import { buildPlayerSnapshot } from '@/server/mappers/playerMapper';
import { fetchAccountByRiotId } from '@/server/riot/account';
import { fetchLeagueEntries, findSoloQueueEntry } from '@/server/riot/league';
import { fetchSummonerByPuuid } from '@/server/riot/summoner';
import { DEFAULT_PROFILE_ICON_ID } from '@/constants/ranking';
import type { ProcessedPlayer } from '@/types/player';

export async function getPlayerProfile(params: {
  apiKey: string;
  gameName: string;
  tagLine: string;
  region: string;
  platform: string;
}): Promise<ProcessedPlayer> {
  const { apiKey, gameName, tagLine, region, platform } = params;

  try {
    const account = await fetchAccountByRiotId(apiKey, gameName, tagLine, region);
    if (!account) {
      throw new Error('Erro Account-V1');
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);

    const summoner = await fetchSummonerByPuuid(apiKey, account.puuid, platform);
    await sleep(DELAY_BETWEEN_REQUESTS_MS);

    const league = await fetchLeagueEntries(apiKey, account.puuid, platform);
    if (!league.ok) {
      throw new Error(`Erro League-V4 (${league.status})`);
    }
    const soloEntry = findSoloQueueEntry(league.entries);

    return buildPlayerSnapshot({
      gameName,
      tagLine,
      puuid: account.puuid,
      profileIconId: summoner.profileIconId,
      soloEntry,
    });
  } catch (err: any) {
    return buildPlayerSnapshot({
      gameName,
      tagLine,
      puuid: '',
      profileIconId: DEFAULT_PROFILE_ICON_ID,
      soloEntry: null,
      status: 'ERROR',
      errorMessage: err.message,
    });
  }
}
