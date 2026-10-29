import { Button } from '@/components/atoms/Button';
import { MatchHistory } from '@/components/matches/MatchHistory';
import { PlayerHero } from '@/components/matches/PlayerHero';
import type { MatchSummary } from '@/types/match';
import type { ProcessedPlayer } from '@/types/player';

interface PlayerDetailViewProps {
  player: ProcessedPlayer;
  matches: MatchSummary[];
  isLoading: boolean;
  isRefreshing: boolean;
  refreshError: string | null;
  expandedMatchId: string | null;
  onBack: () => void;
  onRefresh: () => void;
  onToggleExpand: (matchId: string) => void;
}

export function PlayerDetailView({
  player,
  matches,
  isLoading,
  isRefreshing,
  refreshError,
  expandedMatchId,
  onBack,
  onRefresh,
  onToggleExpand,
}: PlayerDetailViewProps) {
  return (
    <main style={{ maxWidth: 950, margin: '32px auto', padding: '0 16px' }}>
      <Button variant="ghost" onClick={onBack} style={{ marginBottom: 16 }}>
        ← Voltar ao Ranking
      </Button>
      <PlayerHero
        player={player}
        isRefreshing={isRefreshing}
        refreshError={refreshError}
        onRefresh={onRefresh}
      />
      <h3 style={{ fontSize: '1.1rem', marginBottom: 12, color: '#d1d4dc' }}>Histórico de Partidas</h3>
      <MatchHistory
        matches={matches}
        isLoading={isLoading}
        selectedPuuid={player.puuid}
        expandedMatchId={expandedMatchId}
        onToggleExpand={onToggleExpand}
      />
    </main>
  );
}