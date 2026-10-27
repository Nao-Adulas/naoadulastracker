import 'dotenv/config';

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const RIOT_API_KEY = (process.env.RIOT_API_KEY || '').trim().replace(/[\r\n]+/g, '');
export const DELAY_BETWEEN_REQUESTS_MS = 250;

export function assertWorkerEnv() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RIOT_API_KEY) {
    console.error('[ERRO] Faltam variáveis de ambiente essenciais.');
    process.exit(1);
  }
}
