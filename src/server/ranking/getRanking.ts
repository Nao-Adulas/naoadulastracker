import { sortPlayersByRank } from '@/lib/ranking';
import { mapPlayerRow } from '@/server/mappers/playerMapper';
import { getSupabaseAdmin } from '@/server/supabase/admin';
import type { PlayerRow, ProcessedPlayer } from '@/types/player';

export async function getRanking(): Promise<ProcessedPlayer[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('players').select('*');

  if (error) {
    throw new Error(error.message);
  }

  const players = (data as PlayerRow[] | null)?.map(mapPlayerRow) ?? [];
  return sortPlayersByRank(players);
}
