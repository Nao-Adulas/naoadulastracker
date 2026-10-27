import { DELAY_BETWEEN_REQUESTS_MS } from '../config.js';
import {
  fetchAccountByRiotId,
  fetchLeagueEntriesByPuuid,
  fetchSummonerByPuuid,
  findSoloQueueEntry,
  toPlayerUpsert,
} from '../lib/riot.js';
import { sleep } from '../lib/sleep.js';
import { supabase } from '../lib/supabase.js';
import { TRACKED_PLAYERS } from '../lib/trackedPlayers.js';

export async function updateDailyRanking() {
  console.log('[WORKER] 📊 A atualizar o ranking diário dos jogadores...');

  for (const player of TRACKED_PLAYERS) {
    try {
      const accountRes = await fetchAccountByRiotId(player.gameName, player.tagLine, player.region);
      if (!accountRes.ok) {
        console.error(`❌ [RIOT] Erro Account-V1 para ${player.gameName} (${accountRes.status})`);
        continue;
      }

      const accountData = await accountRes.json();
      await sleep(DELAY_BETWEEN_REQUESTS_MS);

      const summonerRes = await fetchSummonerByPuuid(accountData.puuid, player.platform);
      let profileIconId = 29;
      let summonerId = null;
      if (summonerRes.ok) {
        const summonerData = await summonerRes.json();
        profileIconId = summonerData.profileIconId || 29;
        summonerId = summonerData.id || null;
      }
      await sleep(DELAY_BETWEEN_REQUESTS_MS);

      const leagueRes = await fetchLeagueEntriesByPuuid(accountData.puuid, player.platform);
      const leagueEntries = leagueRes.ok ? await leagueRes.json() : [];
      const soloEntry = findSoloQueueEntry(leagueEntries);

      const payload = toPlayerUpsert({
        puuid: accountData.puuid,
        gameName: player.gameName,
        tagLine: player.tagLine,
        summonerId,
        profileIconId,
        soloEntry,
      });

      const { error: upsertError } = await supabase
        .from('players')
        .upsert(payload, { onConflict: 'puuid' });

      if (upsertError) {
        console.error(`❌ [SUPABASE] Erro ao salvar ${player.gameName}:`, upsertError.message);
      } else {
        console.log(
          `✅ [RANKING] Sucesso: ${player.gameName} (${payload.wins}W / ${payload.losses}L - ${payload.tier})`
        );
      }

      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    } catch (err) {
      console.error(`❌ [EXCEÇÃO] Erro com ${player.gameName}:`, err.message);
    }
  }
}
