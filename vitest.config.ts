/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { getViteConfig } from 'astro/config';

/**
 * Unit tests cover the pure logic in `src/lib/` — purchase routing, formatting,
 * and URL composition. The data-access functions in `catalog.ts` are exercised by
 * the build and the end-to-end tests instead, because their value is in reading
 * real content, and a mocked content store would only assert that the mock works.
 *
 * `catalog.ts` imports `astro:content` at module scope, so importing it for a
 * currency formatter would otherwise require booting Astro's content layer. The
 * alias below points that import at a stub instead.
 */
export default getViteConfig({
  resolve: {
    alias: {
      'astro:content': fileURLToPath(new URL('./tests/stubs/astro-content.ts', import.meta.url)),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
  },
});
