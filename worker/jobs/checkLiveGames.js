import { DELAY_BETWEEN_REQUESTS_MS } from '../config.js';
import { fetchActiveGameByPuuid } from '../lib/riot.js';
import { sleep } from '../lib/sleep.js';
import { supabase } from '../lib/supabase.js';

export async function checkLiveGames() {
  console.log('[WORKER] 🔴 A verificar partidas ao vivo...');

  const { data: dbPlayers, error } = await supabase.from('players').select('*');
  if (error || !dbPlayers) {
    console.error('Erro ao buscar jogadores do Supabase:', error);
    return;
  }

  for (const player of dbPlayers) {
    if (!player.puuid) continue;

    try {
      const res = await fetchActiveGameByPuuid(player.puuid, player.platform || 'br1');

      if (res.status === 200) {
        const gameData = await res.json();
        await supabase
          .from('players')
          .update({
            is_online: true,
            current_game_id: String(gameData.gameId),
            game_start_time: gameData.gameStartTime,
          })
          .eq('id', player.id);

        console.log(`🟢 [LIVE] ${player.game_name} está em jogo!`);
      } else {
        await supabase
          .from('players')
          .update({
            is_online: false,
            current_game_id: null,
            game_start_time: null,
          })
          .eq('id', player.id);
      }

      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    } catch (err) {
      console.error(`Erro ao checar live de ${player.game_name}:`, err.message);
    }
  }
}
