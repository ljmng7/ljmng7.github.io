const baseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

const basePath = baseUrl === "/" ? "" : baseUrl.slice(0, -1);

export type AppRoute =
  | "home"
  | "privacy"
  | "support";

export const publicUrl = (path: string) => {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }

  return `${baseUrl}${path.replace(/^\/+/, "")}`;
};

export const appRoutePath = (route: AppRoute) => {
  switch (route) {
    case "privacy":
      return `${basePath}/privacy`;
    case "support":
      return `${basePath}/support`;
    case "home":
      return `${basePath}/`;
  }
};

export const appRouteFromPathname = (pathname: string): AppRoute => {
  const pathWithinSite =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;

  switch (pathWithinSite.replace(/\/$/, "")) {
    case "/privacy":
      return "privacy";
    case "/support":
      return "support";
    default:
      return "home";
  }
};
