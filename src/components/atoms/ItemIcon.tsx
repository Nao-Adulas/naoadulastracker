import { getItemIconUrl } from '@/lib/riotAssets';

interface ItemIconProps {
  itemId: number;
  size?: number;
}

export function ItemIcon({ itemId, size = 20 }: ItemIconProps) {
  if (!itemId || itemId <= 0) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 3,
          backgroundColor: '#18191e',
        }}
      />
    );
  }

  return (
    <img
      src={getItemIconUrl(itemId)}
      alt="item"
      style={{
        width: size,
        height: size,
        borderRadius: 3,
        backgroundColor: '#111',
      }}
    />
  );
}
