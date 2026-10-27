import { getMedalSrc } from '@/lib/riotAssets';

interface RankMedalProps {
  position: number;
}

export function RankMedal({ position }: RankMedalProps) {
  const src = getMedalSrc(position);
  if (!src) {
    return <span style={{ color: '#808088' }}>{position + 1}</span>;
  }

  const labels = ['1º Lugar', '2º Lugar', '3º Lugar'];
  return (
    <img
      src={src}
      alt={labels[position]}
      style={{ width: 40, height: 40, objectFit: 'contain', verticalAlign: 'middle' }}
    />
  );
}
