const baseUrl = import.meta.env.BASE_URL;

export function publicAsset(path: string) {
  return `${baseUrl}${path.replace(/^\/+/, "")}`;
}

export function appPathname(pathname = window.location.pathname) {
  const withoutBase = pathname.startsWith(baseUrl)
    ? pathname.slice(baseUrl.length)
    : pathname.replace(/^\/+/, "");
  const normalized = `/${withoutBase}`.replace(/\/+$/, "");
  return normalized || "/";
}

export function appUrl(path: string, search = "") {
  const normalized = path === "/" ? "" : path.replace(/^\/+/, "");
  return `${baseUrl}${normalized}${search}`;
}
