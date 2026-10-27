import { DEFAULT_PROFILE_ICON_ID } from '@/constants/ranking';
import type { LeagueEntryDto } from '@/server/riot/league';
import type { PlayerRow, ProcessedPlayer, PlayerStatus } from '@/types/player';

export function mapPlayerRow(row: PlayerRow): ProcessedPlayer {
  const tier = row.tier || 'UNRANKED';
  return {
    gameName: row.game_name,
    tagLine: row.tag_line,
    riotId: row.riot_id || `${row.game_name}#${row.tag_line}`,
    puuid: row.puuid,
    profileIconId: row.profile_icon_id || DEFAULT_PROFILE_ICON_ID,
    tier,
    rank: row.rank || '',
    leaguePoints: row.league_points || 0,
    wins: row.wins || 0,
    losses: row.losses || 0,
    winRate: row.win_rate !== null && row.win_rate !== undefined ? Number(row.win_rate) : null,
    status: tier && tier !== 'UNRANKED' ? 'SUCCESS' : 'UNRANKED',
    is_online: Boolean(row.is_online),
  };
}

export function buildPlayerSnapshot(params: {
  gameName: string;
  tagLine: string;
  puuid: string;
  profileIconId: number;
  soloEntry: LeagueEntryDto | null;
  status?: PlayerStatus;
  errorMessage?: string;
}): ProcessedPlayer {
  const wins = params.soloEntry?.wins || 0;
  const losses = params.soloEntry?.losses || 0;
  const total = wins + losses;
  const winRate = total > 0 ? Number(((wins / total) * 100).toFixed(1)) : null;
  const hasRank = Boolean(params.soloEntry);

  return {
    gameName: params.gameName,
    tagLine: params.tagLine,
    riotId: `${params.gameName}#${params.tagLine}`,
    puuid: params.puuid,
    profileIconId: params.profileIconId,
    tier: params.soloEntry?.tier || (params.status === 'ERROR' ? 'UNAVAILABLE' : 'UNRANKED'),
    rank: params.soloEntry?.rank || '',
    leaguePoints: params.soloEntry?.leaguePoints || 0,
    wins,
    losses,
    winRate: params.status === 'ERROR' ? null : winRate,
    status: params.status || (hasRank ? 'SUCCESS' : 'UNRANKED'),
    errorMessage: params.errorMessage,
  };
}

export function toPlayerUpsert(params: {
  puuid: string;
  gameName: string;
  tagLine: string;
  summonerId: string | null;
  profileIconId: number;
  soloEntry: LeagueEntryDto | null;
}) {
  const wins = params.soloEntry?.wins || 0;
  const losses = params.soloEntry?.losses || 0;
  const total = wins + losses;
  const winRate = total > 0 ? parseFloat(((wins / total) * 100).toFixed(1)) : 0;

  return {
    puuid: params.puuid,
    game_name: params.gameName,
    tag_line: params.tagLine,
    riot_id: `${params.gameName}#${params.tagLine}`,
    summoner_id: params.summonerId,
    profile_icon_id: params.profileIconId,
    tier: params.soloEntry?.tier || 'UNRANKED',
    rank: params.soloEntry?.rank || '',
    league_points: params.soloEntry?.leaguePoints || 0,
    wins,
    losses,
    win_rate: winRate,
  };
}
