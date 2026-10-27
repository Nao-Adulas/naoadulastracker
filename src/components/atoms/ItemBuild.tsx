import { ItemIcon } from '@/components/atoms/ItemIcon';

interface ItemBuildProps {
  items: number[];
  gap?: number;
  grid?: boolean;
}

export function ItemBuild({ items, gap = 2, grid = false }: ItemBuildProps) {
  return (
    <div
      style={
        grid
          ? { display: 'grid', gridTemplateColumns: 'repeat(4, 20px)', gap }
          : { display: 'flex', gap }
      }
    >
      {items.map((itemId, index) => (
        <ItemIcon key={`${itemId}-${index}`} itemId={itemId} />
      ))}
    </div>
  );
}
