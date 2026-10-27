import { MatchCard } from '@/components/matches/MatchCard';
import type { MatchSummary } from '@/types/match';

interface MatchHistoryProps {
  matches: MatchSummary[];
  isLoading: boolean;
  selectedPuuid: string;
  expandedMatchId: string | null;
  onToggleExpand: (matchId: string) => void;
}

export function MatchHistory({
  matches,
  isLoading,
  selectedPuuid,
  expandedMatchId,
  onToggleExpand,
}: MatchHistoryProps) {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#808088' }}>
        Carregando histórico detalhado da Riot API...
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#808088' }}>
        Nenhuma partida encontrada.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {matches.map((match) => (
        <MatchCard
          key={match.matchId}
          match={match}
          selectedPuuid={selectedPuuid}
          isExpanded={expandedMatchId === match.matchId}
          onToggle={onToggleExpand}
        />
      ))}
    </div>
  );
}
