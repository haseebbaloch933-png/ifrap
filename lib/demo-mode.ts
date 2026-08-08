/**
 * Demonstration mode.
 *
 * TRUE when the app is running as a public demonstration: it then shows the
 * demo login accounts and seeds synthetic sample data so every screen is
 * populated for reviewers.
 *
 * Enabled by `NEXT_PUBLIC_DEMO_MODE=true` (set this on the Vercel demo
 * deployment), and automatically true outside production. A real production
 * deployment handling live beneficiary data must leave it unset — synthetic
 * seed data and visible demo credentials must never appear there.
 */
export const IS_DEMO =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.NODE_ENV !== 'production';
