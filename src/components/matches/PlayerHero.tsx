import { ProfileIcon } from '@/components/atoms/ProfileIcon';
import { Button } from '@/components/atoms/Button';
import { TierIcon } from '@/components/atoms/TierIcon';
import type { ProcessedPlayer } from '@/types/player';

interface PlayerHeroProps {
  player: ProcessedPlayer;
  isRefreshing: boolean;
  refreshError: string | null;
  onRefresh: () => void;
}

export function PlayerHero({ player, isRefreshing, refreshError, onRefresh }: PlayerHeroProps) {
  return (
    <div
      style={{
        backgroundColor: '#1f2026',
        borderRadius: 12,
        border: '1px solid #2c2d33',
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 24,
      }}
    >
      <div style={{ position: 'relative' }}>
        <ProfileIcon iconId={player.profileIconId} size={64} border="2px solid #5383e8" />
        <TierIcon
          tier={player.tier}
          size={42}
          style={{ position: 'absolute', bottom: -8, right: -12 }}
        />
      </div>

      <div>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '1.5rem', color: '#fff' }}>{player.riotId}</h1>
        <p style={{ margin: 0, color: '#808088', fontSize: '0.95rem', textTransform: 'capitalize' }}>
          {player.tier !== 'UNRANKED'
            ? `${player.tier} ${player.rank} — ${player.leaguePoints} LP`
            : 'Unranked'}
        </p>
      </div>

      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
        <Button variant="ghost" onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? 'Atualizando...' : 'Atualizar histórico'}
        </Button>
        {refreshError && (
          <div style={{ marginTop: 6, color: '#e84057', fontSize: '0.8rem' }}>{refreshError}</div>
        )}
      </div>
    </div>
  );
}