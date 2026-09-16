/**
 * Stub for Astro's `astro:content` virtual module, used only by unit tests.
 *
 * `src/lib/catalog.ts` imports `getCollection` and `getEntry` at module scope. The
 * presentation helpers tested in `tests/unit` never call them, so returning empty
 * results keeps the module importable without a content store. Anything that
 * genuinely depends on catalog data is covered end-to-end against a real build.
 */

export async function getCollection(): Promise<never[]> {
  return [];
}

export async function getEntry(): Promise<undefined> {
  return undefined;
}
