import { DEFAULT_PROFILE_ICON_ID } from '@/constants/ranking';
import { platformUrl, riotGet } from '@/server/riot/client';

interface SummonerDto {
  id?: string;
  profileIconId?: number;
  puuid?: string;
}

export async function fetchSummonerByPuuid(
  apiKey: string,
  puuid: string,
  platform: string
): Promise<{ profileIconId: number; summonerId: string | null }> {
  const url = platformUrl(platform, `/lol/summoner/v4/summoners/by-puuid/${puuid}`);
  const { ok, data } = await riotGet<SummonerDto>(url, apiKey);

  if (!ok || !data) {
    return { profileIconId: DEFAULT_PROFILE_ICON_ID, summonerId: null };
  }

  return {
    profileIconId: data.profileIconId || DEFAULT_PROFILE_ICON_ID,
    summonerId: data.id || null,
  };
}
