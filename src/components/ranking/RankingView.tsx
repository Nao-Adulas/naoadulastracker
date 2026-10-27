import { GrinderCard } from '@/components/ranking/GrinderCard';
import { RankingTable } from '@/components/ranking/RankingTable';
import type { ProcessedPlayer } from '@/types/player';

interface RankingViewProps {
  players: ProcessedPlayer[];
  isLoading: boolean;
  lastUpdated: Date | null;
  topGrinder: ProcessedPlayer | null;
  grinderTotalGames: number;
  grinderEstimatedHours: number;
  onSelectPlayer: (player: ProcessedPlayer) => void;
  onUpdate: () => void;
}

export function RankingView({
  players,
  isLoading,
  lastUpdated,
  topGrinder,
  grinderTotalGames,
  grinderEstimatedHours,
  onSelectPlayer,
  onUpdate,
}: RankingViewProps) {
  return (
    <main style={{ maxWidth: 1150, margin: '32px auto', padding: '0 16px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <GrinderCard
            player={topGrinder}
            isLoading={isLoading}
            totalGames={grinderTotalGames}
            estimatedHours={grinderEstimatedHours}
            onSelect={onSelectPlayer}
          />
        </div>
        <RankingTable
          players={players}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
          onSelectPlayer={onSelectPlayer}
          onUpdate={onUpdate}
        />
      </div>
    </main>
  );
}
