export const DELAY_BETWEEN_REQUESTS_MS = 250;
export const MATCH_REQUEST_DELAY_MS = 100;

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
