import type { NextApiRequest, NextApiResponse } from 'next';
import { getRanking } from '@/server/ranking/getRanking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const players = await getRanking();
    return res.status(200).json({
      players,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Erro ao buscar ranking:', err);
    return res.status(500).json({ error: err.message || 'Erro ao carregar ranking' });
  }
}
