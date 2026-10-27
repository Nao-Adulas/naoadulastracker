import trackedPlayers from '../../../shared/tracked-players.json';
import { DELAY_BETWEEN_REQUESTS_MS, sleep } from '@/server/http/sleep';
import { toPlayerUpsert } from '@/server/mappers/playerMapper';
import { fetchAccountByRiotId } from '@/server/riot/account';
import { fetchLeagueEntries, findSoloQueueEntry } from '@/server/riot/league';
import { fetchSummonerByPuuid } from '@/server/riot/summoner';
import { getSupabaseAdmin } from '@/server/supabase/admin';
import type { TrackedPlayer } from '@/types/player';

export async function syncTrackedPlayers(apiKey: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const players = trackedPlayers as TrackedPlayer[];

  for (const player of players) {
    const account = await fetchAccountByRiotId(
      apiKey,
      player.gameName,
      player.tagLine,
      player.region
    );
    if (!account) continue;
    await sleep(DELAY_BETWEEN_REQUESTS_MS);

    const summoner = await fetchSummonerByPuuid(apiKey, account.puuid, player.platform);
    await sleep(DELAY_BETWEEN_REQUESTS_MS);

    const league = await fetchLeagueEntries(apiKey, account.puuid, player.platform);
    const soloEntry = findSoloQueueEntry(league.entries);

    await supabase.from('players').upsert(
      toPlayerUpsert({
        puuid: account.puuid,
        gameName: player.gameName,
        tagLine: player.tagLine,
        summonerId: summoner.summonerId,
        profileIconId: summoner.profileIconId,
        soloEntry,
      }),
      { onConflict: 'puuid' }
    );

    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }
}
