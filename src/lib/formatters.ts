export function formatGameDate(timestamp: number): string {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatGameDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)} min`;
}

export function formatWinRate(winRate: number | null): string {
  return winRate !== null ? `${winRate}%` : '—';
}
