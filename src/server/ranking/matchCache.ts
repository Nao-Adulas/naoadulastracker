import { getSupabaseAdmin } from '@/server/supabase/admin';
import type { MatchSummary } from '@/types/match';

const TABLE = 'player_matches';
export const MATCHES_LIMIT = 10;

export async function getCachedMatches(
  puuid: string,
  limit = MATCHES_LIMIT
): Promise<MatchSummary[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('data')
    .eq('puuid', puuid)
    .order('game_creation', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.data as MatchSummary);
}

export async function getCachedMatchIds(
  puuid: string,
  matchIds: string[]
): Promise<Set<string>> {
  if (!matchIds.length) return new Set();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('match_id')
    .eq('puuid', puuid)
    .in('match_id', matchIds);

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.match_id as string));
}

export async function saveMatches(puuid: string, matches: MatchSummary[]): Promise<void> {
  if (!matches.length) return;

  const supabase = getSupabaseAdmin();
  const rows = matches.map((match) => ({
    puuid,
    match_id: match.matchId,
    game_creation: match.gameCreation,
    data: match,
  }));

  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'puuid,match_id' });
  if (error) throw new Error(error.message);
}