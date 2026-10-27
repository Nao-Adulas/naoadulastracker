import { AVERAGE_GAME_MINUTES, RANK_ORDER, TIER_ORDER } from '@/constants/ranking';
import type { ProcessedPlayer } from '@/types/player';

export function sortPlayersByRank(players: ProcessedPlayer[]): ProcessedPlayer[] {
  return [...players].sort((a, b) => {
    const tierA = TIER_ORDER[a.tier] || 99;
    const tierB = TIER_ORDER[b.tier] || 99;
    if (tierA !== tierB) return tierA - tierB;

    const rankA = RANK_ORDER[a.rank] || 99;
    const rankB = RANK_ORDER[b.rank] || 99;
    if (rankA !== rankB) return rankA - rankB;

    return (b.leaguePoints || 0) - (a.leaguePoints || 0);
  });
}

export function getTotalGames(player: ProcessedPlayer): number {
  return (player.wins || 0) + (player.losses || 0);
}

export function getTopGrinder(players: ProcessedPlayer[]): ProcessedPlayer | null {
  if (players.length === 0) return null;
  return [...players].sort((a, b) => getTotalGames(b) - getTotalGames(a))[0];
}

export function estimateHoursPlayed(totalGames: number): number {
  return Math.round((totalGames * AVERAGE_GAME_MINUTES) / 60);
}

export function getParticipantItems(participant: {
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
}): number[] {
  return [
    participant.item0,
    participant.item1,
    participant.item2,
    participant.item3,
    participant.item4,
    participant.item5,
    participant.item6,
  ];
}
