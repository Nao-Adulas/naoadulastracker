import { RIOT_API_KEY } from '../config.js';

async function riotGet(url) {
  const res = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY },
  });
  return res;
}

export async function fetchAccountByRiotId(gameName, tagLine, region) {
  const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotGet(url);
}

export async function fetchSummonerByPuuid(puuid, platform) {
  const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return riotGet(url);
}

export async function fetchLeagueEntriesByPuuid(puuid, platform) {
  const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  return riotGet(url);
}

export async function fetchActiveGameByPuuid(puuid, platform) {
  const url = `https://${platform}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`;
  return riotGet(url);
}

export function findSoloQueueEntry(entries) {
  return Array.isArray(entries)
    ? entries.find((entry) => entry.queueType === 'RANKED_SOLO_5x5')
    : null;
}

export function toPlayerUpsert({ puuid, gameName, tagLine, summonerId, profileIconId, soloEntry }) {
  const wins = soloEntry ? soloEntry.wins || 0 : 0;
  const losses = soloEntry ? soloEntry.losses || 0 : 0;
  const total = wins + losses;
  const winRate = total > 0 ? parseFloat(((wins / total) * 100).toFixed(1)) : 0;

  return {
    puuid,
    game_name: gameName,
    tag_line: tagLine,
    riot_id: `${gameName}#${tagLine}`,
    summoner_id: summonerId,
    profile_icon_id: profileIconId,
    tier: soloEntry ? soloEntry.tier : 'UNRANKED',
    rank: soloEntry ? soloEntry.rank : '',
    league_points: soloEntry ? (soloEntry.leaguePoints || 0) : 0,
    wins,
    losses,
    win_rate: winRate,
  };
}
