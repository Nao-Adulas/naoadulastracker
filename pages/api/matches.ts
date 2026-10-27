import type { NextApiRequest, NextApiResponse } from 'next';
import { getRiotApiKey } from '@/server/env';
import { getMatchHistory } from '@/server/ranking/getMatchHistory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const puuid = String(req.query.puuid || '');
  const region = String(req.query.region || 'americas');
  const apiKey = getRiotApiKey();

  if (!puuid) {
    return res.status(400).json({ error: 'puuid é obrigatório' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave RIOT_API_KEY ausente' });
  }

  try {
    const matches = await getMatchHistory({ apiKey, puuid, region });
    return res.status(200).json({ matches });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao carregar histórico' });
  }
}
