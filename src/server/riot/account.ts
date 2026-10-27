import { riotGet, regionalUrl } from '@/server/riot/client';

interface AccountDto {
  puuid: string;
  gameName?: string;
  tagLine?: string;
}

export async function fetchAccountByRiotId(
  apiKey: string,
  gameName: string,
  tagLine: string,
  region: string
): Promise<AccountDto | null> {
  const url = regionalUrl(
    region,
    `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );
  const { ok, data } = await riotGet<AccountDto>(url, apiKey);
  return ok ? data : null;
}
