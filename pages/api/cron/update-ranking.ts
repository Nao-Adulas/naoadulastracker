import type { NextApiRequest, NextApiResponse } from 'next';
import { assertRankingEnv, getRiotApiKey } from '@/server/env';
import { syncTrackedPlayers } from '@/server/ranking/syncPlayers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    assertRankingEnv();
    await syncTrackedPlayers(getRiotApiKey());
    return res.status(200).json({ success: true, message: 'Ranking atualizado com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || 'Erro ao atualizar ranking',
    });
  }
}
