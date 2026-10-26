import type { NextApiRequest, NextApiResponse } from 'next';

const DELAY_BETWEEN_REQUESTS_MS = 100;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { puuid, region = 'americas' } = req.query;

  const rawApiKey = process.env.RIOT_API_KEY || '';
  const cleanKey = rawApiKey.trim().replace(/[\r\n]+/g, '');

  if (!puuid) {
    return res.status(400).json({ error: 'puuid é obrigatório' });
  }

  if (!cleanKey) {
    return res.status(500).json({ error: 'Chave RIOT_API_KEY ausente' });
  }

  try {
    // 1. Buscar os IDs das últimas 10 partidas (reduzido para 10 para evitar timeout por excesso de requisições)
    const matchIdsUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=10&api_key=${cleanKey}`;
    const idsRes = await fetch(matchIdsUrl);
    if (!idsRes.ok) {
      throw new Error(`Erro ao buscar IDs de partidas (${idsRes.status})`);
    }
    const matchIds: string[] = await idsRes.json();

    if (!matchIds || matchIds.length === 0) {
      return res.status(200).json({ matches: [] });
    }

    // 2. Buscar detalhes de cada partida e estruturar os dois times
    const matches = [];
    for (const matchId of matchIds) {
      try {
        const matchUrl = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${cleanKey}`;
        const matchRes = await fetch(matchUrl);
        
        if (matchRes.ok) {
          const matchData = await matchRes.json();
          const info = matchData.info;

          // Descobrir se o jogador pesquisado venceu essa partida
          const playerParticipant = info.participants.find((p: any) => p.puuid === puuid);
          const playerWin = playerParticipant ? playerParticipant.win : false;

          // Organizar os participantes por equipe (Team 100 = Azul, Team 200 = Vermelho)
          const teamsMap: Record<number, any> = {
            100: { teamId: 100, win: false, participants: [] },
            200: { teamId: 200, win: false, participants: [] }
          };

          info.teams.forEach((t: any) => {
            if (teamsMap[t.teamId]) {
              teamsMap[t.teamId].win = t.win;
            }
          });

          info.participants.forEach((p: any) => {
            const kills = p.kills || 0;
            const deaths = p.deaths || 0;
            const assists = p.assists || 0;
            const kda = deaths === 0 ? 'Perfect' : ((kills + assists) / deaths).toFixed(2);

            const participantFormatted = {
              puuid: p.puuid,
              summonerName: p.summonerName || p.riotIdGameName || 'Invocador',
              riotId: p.riotIdGameName && p.riotIdTagline ? `${p.riotIdGameName}#${p.riotIdTagline}` : p.summonerName,
              championName: p.championName,
              champLevel: p.champLevel,
              kills,
              deaths,
              assists,
              kda,
              totalDamageDealtToChampions: p.totalDamageDealtToChampions || 0,
              wardsPlaced: p.wardsPlaced || 0,
              wardsKilled: p.wardsKilled || 0,
              visionWardsBoughtInGame: p.visionWardsBoughtInGame || 0,
              totalMinionsKilled: (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0),
              item0: p.item0 || 0,
              item1: p.item1 || 0,
              item2: p.item2 || 0,
              item3: p.item3 || 0,
              item4: p.item4 || 0,
              item5: p.item5 || 0,
              item6: p.item6 || 0, // Trinket
            };

            if (teamsMap[p.teamId]) {
              teamsMap[p.teamId].participants.push(participantFormatted);
            }
          });

          matches.push({
            matchId,
            gameMode: info.gameMode,
            gameDuration: info.gameDuration, // segundos
            gameCreation: info.gameCreation,
            playerWin,
            teams: [teamsMap[100], teamsMap[200]]
          });
        }
        await sleep(DELAY_BETWEEN_REQUESTS_MS);
      } catch (e) {
        console.error(`Erro ao buscar detalhes da partida ${matchId}:`, e);
      }
    }

    return res.status(200).json({ matches });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao carregar histórico' });
  }
}