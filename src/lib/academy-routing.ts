/** Auth.js can reconstruct NextRequest without Next's basePath metadata. */
export function academyPathname(pathname: string): string {
  if (pathname === '/academy') return '/';
  return pathname.startsWith('/academy/') ? pathname.slice('/academy'.length) : pathname;
}
