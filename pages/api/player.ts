import type { NextApiRequest, NextApiResponse } from 'next';

const DELAY_BETWEEN_REQUESTS_MS = 250;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { gameName, tagLine, region = 'americas', platform = 'br1' } = req.query;

  const rawApiKey = process.env.RIOT_API_KEY || '';
  const cleanKey = rawApiKey.trim().replace(/[\r\n]+/g, '');

  if (!gameName || !tagLine) {
    return res.status(400).json({ error: 'gameName e tagLine são obrigatórios' });
  }

  if (!cleanKey) {
    return res.status(500).json({ error: 'Chave RIOT_API_KEY ausente' });
  }

  try {
    // 1. Account-V1 para pegar o PUUID
    const accountUrl = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      gameName as string
    )}/${encodeURIComponent(tagLine as string)}?api_key=${cleanKey}`;

    const accountRes = await fetch(accountUrl);
    if (!accountRes.ok) throw new Error(`Erro Account-V1 (${accountRes.status})`);
    const accountData = await accountRes.json();
    await sleep(DELAY_BETWEEN_REQUESTS_MS);

    // 2. Summoner-V4 para pegar o profileIconId e summonerId
    const summonerUrl = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}?api_key=${cleanKey}`;
    const summonerRes = await fetch(summonerUrl);
    let profileIconId = 29; // Ícone padrão caso falhe
    if (summonerRes.ok) {
      const summonerData = await summonerRes.json();
      profileIconId = summonerData.profileIconId || 29;
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);

    // 3. League-V4 para pegar o Elo (Tier, Rank, LP, Wins, Losses)
    const leagueUrl = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${accountData.puuid}?api_key=${cleanKey}`;
    const leagueRes = await fetch(leagueUrl);
    if (!leagueRes.ok) throw new Error(`Erro League-V4 (${leagueRes.status})`);

    const leagueEntries = await leagueRes.json();
    const soloEntry = leagueEntries.find((e: any) => e.queueType === 'RANKED_SOLO_5x5');

    if (!soloEntry) {
      return res.status(200).json({
        gameName,
        tagLine,
        riotId: `${gameName}#${tagLine}`,
        puuid: accountData.puuid,
        profileIconId,
        tier: 'UNRANKED',
        rank: '',
        leaguePoints: 0,
        wins: 0,
        losses: 0,
        winRate: null,
        status: 'UNRANKED',
      });
    }

    const wins = soloEntry.wins || 0;
    const losses = soloEntry.losses || 0;
    const total = wins + losses;
    const winRate = total > 0 ? Number(((wins / total) * 100).toFixed(1)) : null;

    return res.status(200).json({
      gameName,
      tagLine,
      riotId: `${gameName}#${tagLine}`,
      puuid: accountData.puuid,
      profileIconId,
      tier: soloEntry.tier,
      rank: soloEntry.rank,
      leaguePoints: soloEntry.leaguePoints || 0,
      wins,
      losses,
      winRate,
      status: 'SUCCESS',
    });
  } catch (err: any) {
    return res.status(200).json({
      gameName,
      tagLine,
      riotId: `${gameName}#${tagLine}`,
      puuid: '',
      profileIconId: 29,
      tier: 'UNAVAILABLE',
      rank: '',
      leaguePoints: 0,
      wins: 0,
      losses: 0,
      winRate: null,
      status: 'ERROR',
      errorMessage: err.message,
    });
  }
}