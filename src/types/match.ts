export interface MatchParticipant {
  puuid: string;
  summonerName: string;
  riotId: string;
  championName: string;
  champLevel: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
  totalDamageDealtToChampions: number;
  wardsPlaced: number;
  wardsKilled: number;
  visionWardsBoughtInGame: number;
  totalMinionsKilled: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
}

export interface MatchTeam {
  teamId: number;
  win: boolean;
  participants: MatchParticipant[];
}

export interface MatchSummary {
  matchId: string;
  gameMode: string;
  gameDuration: number;
  gameCreation: number;
  playerWin: boolean;
  teams: MatchTeam[];
}

export interface MatchesResponse {
  matches: MatchSummary[];
}
