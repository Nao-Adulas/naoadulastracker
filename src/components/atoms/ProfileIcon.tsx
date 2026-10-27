import { getProfileIconUrl } from '@/lib/riotAssets';

interface ProfileIconProps {
  iconId: number;
  size?: number;
  border?: string;
}

export function ProfileIcon({ iconId, size = 38, border = '1px solid #444' }: ProfileIconProps) {
  return (
    <img
      src={getProfileIconUrl(iconId)}
      alt="Perfil"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border,
        objectFit: 'cover',
      }}
      onError={(e) => {
        (e.target as HTMLElement).style.display = 'none';
      }}
    />
  );
}
