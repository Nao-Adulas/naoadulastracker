import { ProfileIcon } from '@/components/atoms/ProfileIcon';
import type { ProcessedPlayer } from '@/types/player';

interface GrinderCardProps {
  player: ProcessedPlayer | null;
  isLoading: boolean;
  totalGames: number;
  estimatedHours: number;
  onSelect: (player: ProcessedPlayer) => void;
}

export function GrinderCard({
  player,
  isLoading,
  totalGames,
  estimatedHours,
  onSelect,
}: GrinderCardProps) {
  return (
    <aside
      style={{
        backgroundColor: '#1f2026',
        borderRadius: 12,
        border: '1px solid #2c2d33',
        padding: 20,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: '1.2rem' }}>⏳</span>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#3498db' }}>
          Mais Partidas na Season
        </h3>
      </div>

      {player && player.status === 'SUCCESS' ? (
        <div
          onClick={() => onSelect(player)}
          style={{
            backgroundColor: '#18191e',
            border: '1px solid #2c2d33',
            borderRadius: 8,
            padding: 16,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3498db';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#2c2d33';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
            <ProfileIcon iconId={player.profileIconId} size={64} border="2px solid #3498db" />
          </div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#5383e8', fontWeight: 'bold' }}>
            {player.riotId}
          </h4>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              backgroundColor: '#1f2026',
              borderRadius: 6,
              padding: '10px 8px',
              border: '1px solid #2c2d33',
              marginTop: 12,
            }}
          >
            <div>
              <div style={{ fontSize: '0.70rem', color: '#808088', textTransform: 'uppercase' }}>
                Total de Partidas
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff' }}>
                {totalGames} jogos
              </div>
            </div>
            <div style={{ borderLeft: '1px solid #2c2d33' }} />
            <div>
              <div style={{ fontSize: '0.70rem', color: '#808088', textTransform: 'uppercase' }}>
                Tempo Estimado
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#3498db' }}>
                ~{estimatedHours} hrs
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            textTransform: 'capitalize',
            color: '#808088',
            fontSize: '0.85rem',
            textAlign: 'center',
            padding: '20px 0',
          }}
        >
          {isLoading ? 'Calculando...' : 'Sem dados suficientes'}
        </div>
      )}
    </aside>
  );
}
