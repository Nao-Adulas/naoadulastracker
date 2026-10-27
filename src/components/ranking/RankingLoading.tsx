import { Spinner } from '@/components/atoms/Spinner';

export function RankingLoading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 0',
        gap: 12,
      }}
    >
      <Spinner />
      <span style={{ color: '#808088', fontWeight: 500, fontSize: '0.9rem' }}>
        A atualizar dados na Riot e Supabase...
      </span>
    </div>
  );
}
