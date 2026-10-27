import { getChampionIconUrl } from '@/lib/riotAssets';

interface ChampionIconProps {
  championName: string;
  size?: number;
  level?: number;
}

export function ChampionIcon({ championName, size = 42, level }: ChampionIconProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <img
        src={getChampionIconUrl(championName)}
        alt={championName}
        style={{ width: size, height: size, borderRadius: '50%' }}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
      {level !== undefined && (
        <span
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            backgroundColor: '#111',
            color: '#fff',
            fontSize: '0.65rem',
            padding: '1px 4px',
            borderRadius: '50%',
            border: '1px solid #444',
          }}
        >
          {level}
        </span>
      )}
    </div>
  );
}
