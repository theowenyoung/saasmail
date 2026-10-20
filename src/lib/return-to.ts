/**
 * Post-login return path. AuthGuard sends signed-out visitors to
 * `/login?next=<path>` so a deep link — e.g. the `/m/<emailId>` link in a
 * forwarded email — survives the sign-in round-trip instead of landing on `/`.
 */
export function loginPathFor(loc: {
  pathname: string;
  search: string;
  hash: string;
}): string {
  const here = `${loc.pathname}${loc.search}${loc.hash}`;
  return here === "/" ? "/login" : `/login?next=${encodeURIComponent(here)}`;
}

/**
 * Resolves `next` to a same-origin path, falling back to `/`. Anything that
 * points off-origin (`//evil.com`, `https://…`, `javascript:`) is dropped so
 * the login page can't be used as an open redirect.
 */
export function safeReturnTo(
  raw: string | null,
  origin: string = window.location.origin,
): string {
  if (!raw) return "/";
  try {
    const url = new URL(raw, origin);
    if (url.origin !== origin) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
