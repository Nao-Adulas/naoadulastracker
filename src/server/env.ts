export function getRiotApiKey(): string {
  return (process.env.RIOT_API_KEY || '').trim().replace(/[\r\n]+/g, '');
}

export function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function assertRankingEnv(): void {
  if (!getRiotApiKey() || !getSupabaseUrl() || !getSupabaseServiceRoleKey()) {
    throw new Error('Variáveis de ambiente do Supabase ou Riot em falta no servidor.');
  }
}
