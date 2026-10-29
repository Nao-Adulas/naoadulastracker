import cron from 'node-cron';
import { assertWorkerEnv } from './config.js';
import { updateDailyRanking } from './jobs/updateDailyRanking.js';

assertWorkerEnv();

// Roda todo dia à meia-noite
cron.schedule(
  '0 0 * * *',
  () => {
    updateDailyRanking();
  },
  { timezone: 'America/Sao_Paulo' }
);

console.log('🚀 Worker do NaoAdulas.gg inicializado e a postos.');