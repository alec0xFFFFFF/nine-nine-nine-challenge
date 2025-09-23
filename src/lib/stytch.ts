export const stytchConfig = {
  projectId: process.env.STYTCH_PROJECT_ID || '',
  secret: process.env.STYTCH_SECRET || '',
  publicToken: process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN || '',
  env: process.env.STYTCH_PROJECT_ENV || 'test',
};