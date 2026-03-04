export function getRequestOrigin(request: Request): string {
  const url = new URL(request.url);

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  const proto = forwardedProto?.split(",")[0]?.trim();
  const host = forwardedHost?.split(",")[0]?.trim() || request.headers.get("host")?.trim();

  if (proto && host) return `${proto}://${host}`;
  if (host) return `${url.protocol}//${host}`;
  return url.origin;
}
