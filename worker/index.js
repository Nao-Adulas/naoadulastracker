import cron from 'node-cron';
import { assertWorkerEnv } from './config.js';
import { checkLiveGames } from './jobs/checkLiveGames.js';
import { updateDailyRanking } from './jobs/updateDailyRanking.js';

assertWorkerEnv();

updateDailyRanking();

cron.schedule('*/5 * * * *', () => {
  checkLiveGames();
});

cron.schedule('0 3 * * *', () => {
  updateDailyRanking();
});

console.log('🚀 Worker do NaoAdulas.gg inicializado e a postos.');
