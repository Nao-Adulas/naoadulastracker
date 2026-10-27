import { OnlineBadge } from '@/components/atoms/OnlineBadge';
import { ProfileIcon } from '@/components/atoms/ProfileIcon';
import { RankMedal } from '@/components/atoms/RankMedal';
import { TierIcon } from '@/components/atoms/TierIcon';
import { formatWinRate } from '@/lib/formatters';
import type { ProcessedPlayer } from '@/types/player';

interface RankingRowProps {
  player: ProcessedPlayer;
  index: number;
  onSelect: (player: ProcessedPlayer) => void;
}

export function RankingRow({ player, index, onSelect }: RankingRowProps) {
  return (
    <tr
      onClick={() => onSelect(player)}
      style={{ borderBottom: '1px solid #2c2d33', cursor: 'pointer', transition: 'background 0.15s' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#25262c';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <td style={{ padding: 16, textAlign: 'center', fontWeight: 'bold' }}>
        <RankMedal position={index} />
      </td>
      <td style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ProfileIcon iconId={player.profileIconId} />
          <TierIcon tier={player.tier} />
          <span style={{ fontWeight: 600, color: '#5383e8' }}>{player.riotId}</span>
          {player.is_online && <OnlineBadge />}
        </div>
      </td>
      <td style={{ padding: 16 }}>
        {player.status === 'ERROR' ? (
          <span style={{ color: '#e74c3c' }}>Erro</span>
        ) : player.status === 'UNRANKED' ? (
          <span style={{ color: '#808088' }}>Unranked</span>
        ) : (
          <span style={{ fontWeight: 600, color: '#d1d4dc', textTransform: 'capitalize' }}>
            {player.tier.toLowerCase()} {player.rank}
          </span>
        )}
      </td>
      <td style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>
        {player.status === 'SUCCESS' ? `${player.leaguePoints} LP` : '—'}
      </td>
      <td style={{ padding: 16, textAlign: 'right', fontSize: '0.85rem' }}>
        {player.status === 'SUCCESS' ? (
          <span>
            <strong style={{ color: '#2ecc71' }}>{player.wins}V</strong>{' '}
            <strong style={{ color: '#e74c3c' }}>{player.losses}D</strong>
          </span>
        ) : (
          '—'
        )}
      </td>
      <td
        style={{
          padding: 16,
          textAlign: 'right',
          fontWeight: 600,
          color: player.winRate && player.winRate >= 50 ? '#5383e8' : '#e74c3c',
        }}
      >
        {formatWinRate(player.winRate)}
      </td>
    </tr>
  );
}
