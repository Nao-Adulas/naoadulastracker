import type { NextApiRequest, NextApiResponse } from 'next';
import { getRiotApiKey } from '@/server/env';
import { getPlayerProfile } from '@/server/ranking/getPlayerProfile';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const gameName = String(req.query.gameName || '');
  const tagLine = String(req.query.tagLine || '');
  const region = String(req.query.region || 'americas');
  const platform = String(req.query.platform || 'br1');
  const apiKey = getRiotApiKey();

  if (!gameName || !tagLine) {
    return res.status(400).json({ error: 'gameName e tagLine são obrigatórios' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave RIOT_API_KEY ausente' });
  }

  const player = await getPlayerProfile({
    apiKey,
    gameName,
    tagLine,
    region,
    platform,
  });

  return res.status(200).json(player);
}
