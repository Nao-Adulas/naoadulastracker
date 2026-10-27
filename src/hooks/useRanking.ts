import { useCallback, useEffect, useMemo, useState } from 'react';
import { estimateHoursPlayed, getTopGrinder, getTotalGames } from '@/lib/ranking';
import { fetchRanking, triggerRankingUpdate } from '@/services/rankingService';
import type { ProcessedPlayer } from '@/types/player';

export function useRanking() {
  const [players, setPlayers] = useState<ProcessedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadRanking = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchRanking();
      setPlayers(data.players || []);
      setLastUpdated(data.updatedAt ? new Date(data.updatedAt) : new Date());
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRanking = useCallback(async () => {
    setIsLoading(true);
    try {
      await triggerRankingUpdate();
      await loadRanking();
    } catch (err) {
      console.error('Erro ao atualizar ranking:', err);
      alert(err instanceof Error ? err.message : 'Erro de rede ao atualizar ranking.');
      setIsLoading(false);
    }
  }, [loadRanking]);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  const topGrinder = useMemo(() => getTopGrinder(players), [players]);
  const grinderTotalGames = topGrinder ? getTotalGames(topGrinder) : 0;
  const grinderEstimatedHours = estimateHoursPlayed(grinderTotalGames);

  return {
    players,
    isLoading,
    lastUpdated,
    topGrinder,
    grinderTotalGames,
    grinderEstimatedHours,
    updateRanking,
  };
}
