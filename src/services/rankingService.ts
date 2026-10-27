import type { RankingResponse } from '@/types/player';

export async function fetchRanking(): Promise<RankingResponse> {
  const res = await fetch('/api/ranking');
  if (!res.ok) {
    throw new Error('Não foi possível carregar o ranking');
  }
  return res.json();
}

export async function triggerRankingUpdate(): Promise<void> {
  const res = await fetch('/api/update-ranking', { method: 'POST' });
  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(result.error || 'Erro desconhecido ao atualizar ranking');
  }
}
