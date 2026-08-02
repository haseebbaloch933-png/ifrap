# Next.js Dynamic API Routes Rule

**Trigger**: When creating or modifying Next.js App Router API routes (`route.ts`/`route.js`) that handle dynamic requests.

**Rule**: Always explicitly export a dynamic rendering configuration to prevent Next.js from attempting to statically bundle the route during SSG, which avoids `PageNotFoundError: Cannot find module for page` build errors.

```typescript
export const dynamic = 'force-dynamic';
```
