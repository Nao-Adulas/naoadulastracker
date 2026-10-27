export type PlayerStatus = 'SUCCESS' | 'UNRANKED' | 'ERROR';

export interface TrackedPlayer {
  gameName: string;
  tagLine: string;
  region: string;
  platform: string;
}

export interface PlayerRow {
  id?: number;
  puuid: string;
  game_name: string;
  tag_line: string;
  riot_id: string | null;
  summoner_id?: string | null;
  profile_icon_id: number | null;
  tier: string | null;
  rank: string | null;
  league_points: number | null;
  wins: number | null;
  losses: number | null;
  win_rate: number | string | null;
  is_online?: boolean | null;
  platform?: string | null;
  current_game_id?: string | null;
  game_start_time?: number | null;
}

export interface ProcessedPlayer {
  gameName: string;
  tagLine: string;
  riotId: string;
  puuid: string;
  profileIconId: number;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  winRate: number | null;
  status: PlayerStatus;
  errorMessage?: string;
  is_online?: boolean;
}

export interface RankingResponse {
  players: ProcessedPlayer[];
  updatedAt: string;
}
