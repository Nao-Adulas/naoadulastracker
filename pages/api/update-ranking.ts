import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const rawApiKey = process.env.RIOT_API_KEY || '';
const RIOT_API_KEY = rawApiKey.trim().replace(/[\r\n]+/g, '');

const supabase = createClient(supabaseUrl, serviceRoleKey);

const DELAY_BETWEEN_REQUESTS_MS = 250;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!RIOT_API_KEY || !supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Variáveis de ambiente do Supabase ou Riot em falta no servidor.' });
  }

  try {
    for (const p of PLAYERS) {
      // 1. Account-V1 para o PUUID
      const accountUrl = `https://${p.region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(p.gameName)}/${encodeURIComponent(p.tagLine)}?api_key=${RIOT_API_KEY}`;
      const accountRes = await fetch(accountUrl);
      if (!accountRes.ok) continue;
      const accountData = await accountRes.json();
      await sleep(DELAY_BETWEEN_REQUESTS_MS);

      // 2. Summoner-V4 para ícone e summonerId
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

      // 3. League-V4 por PUUID
      const leagueUrl = `https://${p.platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${accountData.puuid}?api_key=${RIOT_API_KEY}`;
      const leagueRes = await fetch(leagueUrl);
      const leagueEntries = leagueRes.ok ? await leagueRes.json() : [];
      const soloEntry = Array.isArray(leagueEntries) ? leagueEntries.find((e: any) => e.queueType === 'RANKED_SOLO_5x5') : null;

      const wins = soloEntry ? (soloEntry.wins || 0) : 0;
      const losses = soloEntry ? (soloEntry.losses || 0) : 0;
      const total = wins + losses;
      const winRate = total > 0 ? parseFloat(((wins / total) * 100).toFixed(1)) : 0;

      // Upsert no Supabase
      await supabase.from('players').upsert({
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

      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }

    return res.status(200).json({ success: true, message: 'Ranking atualizado com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao atualizar ranking' });
  }
}