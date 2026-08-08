/**
 * Drift guard for H2: asserts the Edge proxy `config.matcher` covers every
 * protected path declared in PROTECTED_ROUTES (lib/auth/rbac.ts).
 * (Next 16 renamed the "middleware" file/function convention to "proxy".)
 *
 * Next.js requires `matcher` to be a static literal, so it cannot be derived
 * from PROTECTED_ROUTES at runtime — the two are maintained by hand and can
 * silently drift (that was the H2 bug: /admin and /fiduciary were protected in
 * the RBAC table but missing from the matcher, so the edge gate never ran).
 *
 * Run directly:  node tests/matcher-coverage.test.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function readMatcherPaths() {
  const src = fs.readFileSync(path.join(root, 'proxy.ts'), 'utf-8');
  const block = src.match(/matcher:\s*\[([\s\S]*?)\]/);
  if (!block) throw new Error('Could not find `matcher: [...]` in proxy.ts');
  const entries = [...block[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
  // Normalize '/telemetry/:path*' -> '/telemetry'
  return entries.map((e) => e.replace(/\/:path\*$/, '').replace(/\/$/, '') || '/');
}

function readProtectedPaths() {
  const src = fs.readFileSync(path.join(root, 'lib', 'auth', 'rbac.ts'), 'utf-8');
  const block = src.match(/PROTECTED_ROUTES[^\[]*\[([\s\S]*?)\];/);
  if (!block) throw new Error('Could not find PROTECTED_ROUTES in rbac.ts');
  return [...block[1].matchAll(/path:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

function isCovered(protectedPath, matcherPaths) {
  return matcherPaths.some(
    (m) => protectedPath === m || protectedPath.startsWith(`${m}/`)
  );
}

function run() {
  const matcherPaths = readMatcherPaths();
  const protectedPaths = readProtectedPaths();

  const missing = protectedPaths.filter((p) => !isCovered(p, matcherPaths));

  if (missing.length > 0) {
    console.error('✗ proxy matcher does NOT cover protected routes:');
    missing.forEach((p) => console.error(`    - ${p} (declared in PROTECTED_ROUTES, absent from proxy.ts matcher)`));
    console.error('  Add matching `<path>/:path*` entries to proxy.ts config.matcher.');
    process.exit(1);
  }

  console.log(`✓ matcher covers all ${protectedPaths.length} protected routes:`);
  protectedPaths.forEach((p) => console.log(`    - ${p}`));
}

run();
