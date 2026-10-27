const DDRAGON_VERSION = '14.23.1';
const DDRAGON_BASE = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img`;

export function getProfileIconUrl(iconId: number): string {
  return `${DDRAGON_BASE}/profileicon/${iconId}.png`;
}

export function getTierIconUrl(tier: string): string {
  if (!tier || tier === 'UNRANKED' || tier === 'UNAVAILABLE') {
    return '/images/Rank=Silver.png';
  }
  const formattedTier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  return `/images/Rank=${formattedTier}.png`;
}

export function getChampionIconUrl(championName: string): string {
  return `${DDRAGON_BASE}/champion/${championName}.png`;
}

export function getItemIconUrl(itemId: number): string {
  return `${DDRAGON_BASE}/item/${itemId}.png`;
}

export function getMedalSrc(position: number): string | null {
  if (position === 0) return '/images/medals/gold.png';
  if (position === 1) return '/images/medals/silver.png';
  if (position === 2) return '/images/medals/bronze.png';
  return null;
}
