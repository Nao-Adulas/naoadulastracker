import { useCallback, useState } from 'react';
import { fetchPlayerMatches } from '@/services/matchesService';
import type { MatchSummary } from '@/types/match';
import type { ProcessedPlayer } from '@/types/player';

export type RankingView = 'home' | 'playerDetail';

export function usePlayerMatches() {
  const [currentView, setCurrentView] = useState<RankingView>('home');
  const [selectedPlayer, setSelectedPlayer] = useState<ProcessedPlayer | null>(null);
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const selectPlayer = useCallback(async (player: ProcessedPlayer) => {
    if (!player.puuid) return;

    setSelectedPlayer(player);
    setCurrentView('playerDetail');
    setIsLoadingMatches(true);
    setExpandedMatchId(null);

    try {
      const data = await fetchPlayerMatches(player.puuid);
      setMatches(data.matches || []);
    } catch (err) {
      console.error('Erro ao buscar partidas:', err);
      setMatches([]);
    } finally {
      setIsLoadingMatches(false);
    }
  }, []);

  const goHome = useCallback(() => {
    setCurrentView('home');
  }, []);

  const toggleExpand = useCallback((matchId: string) => {
    setExpandedMatchId((current) => (current === matchId ? null : matchId));
  }, []);

  return {
    currentView,
    selectedPlayer,
    matches,
    isLoadingMatches,
    expandedMatchId,
    selectPlayer,
    goHome,
    toggleExpand,
  };
}
