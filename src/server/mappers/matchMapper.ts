import type { MatchParticipant, MatchSummary, MatchTeam } from '@/types/match';

function formatKda(kills: number, deaths: number, assists: number): string {
  return deaths === 0 ? 'Perfect' : ((kills + assists) / deaths).toFixed(2);
}

function mapParticipant(p: any): MatchParticipant {
  const kills = p.kills || 0;
  const deaths = p.deaths || 0;
  const assists = p.assists || 0;

  return {
    puuid: p.puuid,
    summonerName: p.summonerName || p.riotIdGameName || 'Invocador',
    riotId:
      p.riotIdGameName && p.riotIdTagline
        ? `${p.riotIdGameName}#${p.riotIdTagline}`
        : p.summonerName,
    championName: p.championName,
    champLevel: p.champLevel,
    kills,
    deaths,
    assists,
    kda: formatKda(kills, deaths, assists),
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
    item6: p.item6 || 0,
  };
}

export function mapMatchDto(matchId: string, matchData: any, puuid: string): MatchSummary {
  const info = matchData.info;
  const playerParticipant = info.participants.find((p: any) => p.puuid === puuid);
  const playerWin = playerParticipant ? playerParticipant.win : false;

  const teamsMap: Record<number, MatchTeam> = {
    100: { teamId: 100, win: false, participants: [] },
    200: { teamId: 200, win: false, participants: [] },
  };

  info.teams.forEach((t: any) => {
    if (teamsMap[t.teamId]) {
      teamsMap[t.teamId].win = t.win;
    }
  });

  info.participants.forEach((p: any) => {
    if (teamsMap[p.teamId]) {
      teamsMap[p.teamId].participants.push(mapParticipant(p));
    }
  });

  return {
    matchId,
    gameMode: info.gameMode,
    gameDuration: info.gameDuration,
    gameCreation: info.gameCreation,
    playerWin,
    teams: [teamsMap[100], teamsMap[200]],
  };
}
