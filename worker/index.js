import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import cron from 'node-cron';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const rawApiKey = process.env.RIOT_API_KEY || '';
const RIOT_API_KEY = rawApiKey.trim().replace(/[\r\n]+/g, '');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RIOT_API_KEY) {
  console.error('[ERRO] Faltam variáveis de ambiente essenciais.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const DELAY_BETWEEN_REQUESTS_MS = 250;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Lista fixa dos jogadores do teu ranking
const PLAYERS = [
  { gameName: "DarkBlackPombao", tagLine: "br1", region: "americas", platform: "br1" },
  { gameName: "BrPG", tagLine: "AC20", region: "americas", platform: "br1" },
  { gameName: "DroopX", tagLine: "FDK", region: "americas", platform: "br1" },
  { gameName: "Dark Black Pomba", tagLine: "DBP", region: "americas", platform: "br1" },
  { gameName: "kingsora", tagLine: "BR1", region: "americas", platform: "br1" },
  { gameName: "croves0gankador", tagLine: "BR1", region: "americas", platform: "br1" },
  { gameName: "Maria Prea", tagLine: "Br24", region: "americas", platform: "br1" },
  { gameName: "ZPR gab 01", tagLine: "mid", region: "americas", platform: "br1" }
];

// --- TAREFA 1: Verificar partidas ao vivo (A cada 5 minutos) ---
async function checkLiveGames() {
  console.log('[WORKER] 🔴 A verificar partidas ao vivo...');
  
  const { data: dbPlayers, error } = await supabase.from('players').select('*');
  if (error || !dbPlayers) {
    console.error('Erro ao buscar jogadores do Supabase:', error);
    return;
  }

  for (const player of dbPlayers) {
    if (!player.puuid) continue;

    try {
      const res = await fetch(`https://${player.platform || 'br1'}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${player.puuid}?api_key=${RIOT_API_KEY}`);
      
      if (res.status === 200) {
        const gameData = await res.json();
        await supabase
          .from('players')
          .update({
            is_online: true,
            current_game_id: String(gameData.gameId),
            game_start_time: gameData.gameStartTime
          })
          .eq('id', player.id);

        console.log(`🟢 [LIVE] ${player.game_name} está em jogo!`);
      } else {
        await supabase
          .from('players')
          .update({
            is_online: false,
            current_game_id: null,
            game_start_time: null
          })
          .eq('id', player.id);
      }
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    } catch (err) {
      console.error(`Erro ao checar live de ${player.game_name}:`, err.message);
    }
  }
}

// --- TAREFA 2: Atualização do Ranking Diário (Exatamente igual ao front-end) ---
async function updateDailyRanking() {
  console.log('[WORKER] 📊 A atualizar o ranking diário dos jogadores...');
  
  for (const p of PLAYERS) {
    try {
      // 1. Account-V1 para pegar o PUUID
      const accountUrl = `https://${p.region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(p.gameName)}/${encodeURIComponent(p.tagLine)}?api_key=${RIOT_API_KEY}`;
      const accountRes = await fetch(accountUrl);
      if (!accountRes.ok) {
        console.error(`❌ [RIOT] Erro Account-V1 para ${p.gameName} (${accountRes.status})`);
        continue;
      }
      const accountData = await accountRes.json();
      await sleep(DELAY_BETWEEN_REQUESTS_MS);

      // 2. Summoner-V4 para pegar o profileIconId e summonerId
      const summonerUrl = `https://${p.platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}?api_key=${RIOT_API_KEY}`;
      const summonerRes = await fetch(summonerUrl);
      let profileIconId = 29;
      let summonerId = null;
      if (summonerRes.ok) {
        const summonerData = await summonerRes.json();
        profileIconId = summonerData.profileIconId || 29;
        summonerId = summonerData.id || null;
      }
      await sleep(DELAY_BETWEEN_REQUESTS_MS);

      // 3. League-V4 por PUUID (O pulo do gato que faltava!)
      const leagueUrl = `https://${p.platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${accountData.puuid}?api_key=${RIOT_API_KEY}`;
      const leagueRes = await fetch(leagueUrl);
      const leagueEntries = leagueRes.ok ? await leagueRes.json() : [];
      const soloEntry = Array.isArray(leagueEntries) ? leagueEntries.find((e) => e.queueType === 'RANKED_SOLO_5x5') : null;

      const wins = soloEntry ? (soloEntry.wins || 0) : 0;
      const losses = soloEntry ? (soloEntry.losses || 0) : 0;
      const total = wins + losses;
      const winRate = total > 0 ? parseFloat(((wins / total) * 100).toFixed(1)) : 0;

      // Gravar/Atualizar no Supabase
      const { error: upsertError } = await supabase.from('players').upsert({
        puuid: accountData.puuid,
        game_name: p.gameName,
        tag_line: p.tagLine,
        riot_id: `${p.gameName}#${p.tagLine}`,
        summoner_id: summonerId,
        profile_icon_id: profileIconId,
        tier: soloEntry ? soloEntry.tier : 'UNRANKED',
        rank: soloEntry ? soloEntry.rank : '',
        league_points: soloEntry ? soloEntry.leaguePoints : 0,
        wins,
        losses,
        win_rate: winRate
      }, { onConflict: 'puuid' });

      if (upsertError) {
        console.error(`❌ [SUPABASE] Erro ao salvar ${p.gameName}:`, upsertError.message);
      } else {
        console.log(`✅ [RANKING] Sucesso: ${p.gameName} (${wins}W / ${losses}L - ${soloEntry ? soloEntry.tier : 'UNRANKED'})`);
      }
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    } catch (err) {
      console.error(`❌ [EXCEÇÃO] Erro com ${p.gameName}:`, err.message);
    }
  }
}

// --- AGENDAMENTOS (CRON) ---

updateDailyRanking();

cron.schedule('*/5 * * * *', () => {
  checkLiveGames();
});

cron.schedule('0 3 * * *', () => {
  updateDailyRanking();
});

console.log('🚀 Worker do NaoAdulas.gg inicializado e a postos.');