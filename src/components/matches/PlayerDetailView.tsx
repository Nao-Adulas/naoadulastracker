import { Button } from '@/components/atoms/Button';
import { MatchHistory } from '@/components/matches/MatchHistory';
import { PlayerHero } from '@/components/matches/PlayerHero';
import type { MatchSummary } from '@/types/match';
import type { ProcessedPlayer } from '@/types/player';

interface PlayerDetailViewProps {
  player: ProcessedPlayer;
  matches: MatchSummary[];
  isLoading: boolean;
  expandedMatchId: string | null;
  onBack: () => void;
  onToggleExpand: (matchId: string) => void;
}

export function PlayerDetailView({
  player,
  matches,
  isLoading,
  expandedMatchId,
  onBack,
  onToggleExpand,
}: PlayerDetailViewProps) {
  return (
    <main style={{ maxWidth: 950, margin: '32px auto', padding: '0 16px' }}>
      <Button variant="ghost" onClick={onBack} style={{ marginBottom: 16 }}>
        ← Voltar ao Ranking
      </Button>
      <PlayerHero player={player} />
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
