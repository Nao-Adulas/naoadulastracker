import type { NextApiRequest, NextApiResponse } from 'next';
import { getRiotApiKey } from '@/server/env';
import { getCachedMatches } from '@/server/ranking/matchCache';
import { syncPlayerMatches } from '@/server/ranking/syncMatches';

// GET  -> cache first: devolve o que está no Supabase; se estiver vazio, busca na Riot e salva.
// POST -> atualização manual: busca na Riot, salva as partidas novas e devolve o histórico.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const puuid = String(req.query.puuid || '');
  const region = String(req.query.region || 'americas');

  if (!puuid) {
    return res.status(400).json({ error: 'puuid é obrigatório' });
  }

  try {
    if (req.method === 'GET') {
      const cached = await getCachedMatches(puuid);
      if (cached.length > 0) {
        return res.status(200).json({ matches: cached, source: 'cache' });
      }
    }

    const apiKey = getRiotApiKey();
    if (!apiKey) {
      return res.status(500).json({ error: 'Chave RIOT_API_KEY ausente' });
    }

    const matches = await syncPlayerMatches({ apiKey, puuid, region });
    return res.status(200).json({ matches, source: 'riot' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao carregar histórico' });
  }
}