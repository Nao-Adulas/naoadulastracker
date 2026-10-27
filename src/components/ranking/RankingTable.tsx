import { RankingEmptyState } from '@/components/ranking/RankingEmptyState';
import { RankingLoading } from '@/components/ranking/RankingLoading';
import { RankingRow } from '@/components/ranking/RankingRow';
import type { ProcessedPlayer } from '@/types/player';

interface RankingTableProps {
  players: ProcessedPlayer[];
  isLoading: boolean;
  lastUpdated: Date | null;
  onSelectPlayer: (player: ProcessedPlayer) => void;
  onUpdate: () => void;
}

export function RankingTable({
  players,
  isLoading,
  lastUpdated,
  onSelectPlayer,
  onUpdate,
}: RankingTableProps) {
  return (
    <div
      style={{
        backgroundColor: '#1f2026',
        borderRadius: 12,
        border: '1px solid #2c2d33',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #2c2d33',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
          Ranking da Galera
        </h2>
        {lastUpdated && (
          <span style={{ fontSize: '0.8rem', color: '#808088' }}>
            Atualizado às {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div style={{ overflowX: 'auto', minHeight: 250, position: 'relative' }}>
        {isLoading ? (
          <RankingLoading />
        ) : players.length === 0 ? (
          <RankingEmptyState onUpdate={onUpdate} />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr
                style={{
                  backgroundColor: '#18191e',
                  color: '#808088',
                  borderBottom: '1px solid #2c2d33',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '14px 16px', textAlign: 'center', width: 60 }}>#</th>
                <th style={{ padding: '14px 16px' }}>Invocador</th>
                <th style={{ padding: '14px 16px' }}>Elo</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>PDL</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Vitórias / Derrotas</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <RankingRow
                  key={player.puuid || player.riotId}
                  player={player}
                  index={index}
                  onSelect={onSelectPlayer}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
