import type { CSSProperties } from 'react';
import { getTierIconUrl } from '@/lib/riotAssets';

interface TierIconProps {
  tier: string;
  size?: number;
  style?: CSSProperties;
}

export function TierIcon({ tier, size = 48, style }: TierIconProps) {
  return (
    <img
      src={getTierIconUrl(tier)}
      alt={tier}
      style={{ width: size, height: size, objectFit: 'contain', ...style }}
      onError={(e) => {
        (e.target as HTMLElement).style.display = 'none';
      }}
    />
  );
}
