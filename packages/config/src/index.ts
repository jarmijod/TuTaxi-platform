export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    timeout: 10000,
  },
  app: {
    name: 'TuTaxi',
    version: '1.0.0',
  },
} as const;
