import { AppHeader } from '@/components/layout/AppHeader';
import { AppShell } from '@/components/layout/AppShell';
import { PlayerDetailView } from '@/components/matches/PlayerDetailView';
import { RankingView } from '@/components/ranking/RankingView';
import { usePlayerMatches } from '@/hooks/usePlayerMatches';
import { useRanking } from '@/hooks/useRanking';

export default function Home() {
  const ranking = useRanking();
  const detail = usePlayerMatches();
  const selectedPlayer = detail.selectedPlayer;
  const isHome = detail.currentView === 'home' || !selectedPlayer;

  return (
    <AppShell>
      <AppHeader
        showUpdate={isHome}
        isLoading={ranking.isLoading}
        onLogoClick={detail.goHome}
        onUpdate={ranking.updateRanking}
      />
      {isHome || !selectedPlayer ? (
        <RankingView
          players={ranking.players}
          isLoading={ranking.isLoading}
          lastUpdated={ranking.lastUpdated}
          topGrinder={ranking.topGrinder}
          grinderTotalGames={ranking.grinderTotalGames}
          grinderEstimatedHours={ranking.grinderEstimatedHours}
          onSelectPlayer={detail.selectPlayer}
          onUpdate={ranking.updateRanking}
        />
      ) : (
        <PlayerDetailView
          player={selectedPlayer}
          matches={detail.matches}
          isLoading={detail.isLoadingMatches}
          isRefreshing={detail.isRefreshing}
          refreshError={detail.refreshError}
          expandedMatchId={detail.expandedMatchId}
          onBack={detail.goHome}
          onRefresh={detail.refreshMatches}
          onToggleExpand={detail.toggleExpand}
        />
      )}
    </AppShell>
  );
}
