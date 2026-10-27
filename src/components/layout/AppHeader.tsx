import { Button } from '@/components/atoms/Button';

interface AppHeaderProps {
  showUpdate: boolean;
  isLoading: boolean;
  onLogoClick: () => void;
  onUpdate: () => void;
}

export function AppHeader({ showUpdate, isLoading, onLogoClick, onUpdate }: AppHeaderProps) {
  return (
    <header
      style={{
        backgroundColor: '#1f2026',
        borderBottom: '1px solid #2c2d33',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div
        onClick={onLogoClick}
        style={{
          fontSize: '1.4rem',
          fontWeight: 'bold',
          color: '#5383e8',
          letterSpacing: '-0.5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        NaoAdulas.gg <span className="halloween-pumpkin">🎃</span>
      </div>
      {showUpdate && (
        <Button onClick={onUpdate} disabled={isLoading}>
          {isLoading ? 'Atualizando...' : 'Atualizar Ranking'}
        </Button>
      )}
    </header>
  );
}
