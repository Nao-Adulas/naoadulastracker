import { Button } from '@/components/atoms/Button';

interface RankingEmptyStateProps {
  onUpdate: () => void;
}

export function RankingEmptyState({ onUpdate }: RankingEmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 20px',
        textAlign: 'center',
        gap: 16,
      }}
    >
      <div style={{ fontSize: '2.5rem' }}>📭</div>
      <p style={{ fontSize: '1.1rem', color: '#d1d4dc', margin: 0, fontWeight: 600 }}>
        Sem dados disponíveis, atualize o ranking
      </p>
      <Button variant="success" onClick={onUpdate} style={{ padding: '10px 20px', marginTop: 8 }}>
        Atualizar Agora
      </Button>
    </div>
  );
}
