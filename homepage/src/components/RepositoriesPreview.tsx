import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import { useLanguage, type Language } from "./LanguageProvider";
import { SparklesText } from "./SparklesText";

const GITHUB_USERNAME = "ljmng7";
const REPOSITORIES_URL = `${import.meta.env.BASE_URL}data/github-repositories.json?v=public-repositories`;
const CACHE_KEY = "jazmin-github-repositories-v4";
const CACHE_MAX_AGE = 6 * 60 * 60 * 1000;

interface Repository {
  archived: boolean;
  description: string | null;
  fork: boolean;
  forksCount: number;
  htmlUrl: string;
  language: string | null;
  name: string;
  starsCount: number;
  pushedAt: string | null;
}

interface RepositoryCache {
  fetchedAt: number;
  repositories: Repository[];
}

const languageColors: Record<string, string> = {
  C: "#555555",
  "C++": "#f34b7d",
  CSS: "#663399",
  HTML: "#e34c26",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Shell: "#89e051",
  Swift: "#f05138",
  TypeScript: "#3178c6",
};

const formatRelativeUpdatedAt = (pushedAt: string, now: number, language: Language) => {
  const elapsed = Math.max(0, now - Date.parse(pushedAt));
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (elapsed < minute) return language === "zh" ? "刚刚更新" : "Updated just now";

  const [divisor, unit]: [number, Intl.RelativeTimeFormatUnit] =
    elapsed < hour
      ? [minute, "minute"]
      : elapsed < day
        ? [hour, "hour"]
        : elapsed < month
          ? [day, "day"]
          : elapsed < year
            ? [month, "month"]
            : [year, "year"];

  const relativeTimeFormatter = new Intl.RelativeTimeFormat(
    language === "zh" ? "zh-CN" : "en",
    { numeric: "always" },
  );
  const relativeTime = relativeTimeFormatter.format(-Math.floor(elapsed / divisor), unit);
  return language === "zh" ? `${relativeTime}更新` : `Updated ${relativeTime}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const parseRepository = (value: unknown): Repository | null => {
  if (!isRecord(value)) return null;

  const {
    archived,
    description,
    fork,
    forksCount,
    htmlUrl,
    language,
    name,
    starsCount,
    pushedAt,
  } = value;

  if (
    typeof name !== "string" ||
    typeof htmlUrl !== "string" ||
    typeof forksCount !== "number" ||
    typeof starsCount !== "number" ||
    typeof fork !== "boolean" ||
    typeof archived !== "boolean" ||
    (pushedAt !== null &&
      (typeof pushedAt !== "string" || Number.isNaN(Date.parse(pushedAt)))) ||
    (description !== null && typeof description !== "string") ||
    (language !== null && typeof language !== "string")
  ) {
    return null;
  }

  return {
    archived,
    description,
    fork,
    forksCount,
    htmlUrl,
    language,
    name,
    starsCount,
    pushedAt,
  };
};

const parseRepositories = (value: unknown) => {
  if (!isRecord(value) || !Array.isArray(value.repositories)) {
    throw new Error("The repository data file has an unexpected shape.");
  }

  return value.repositories
    .map(parseRepository)
    .filter((repository): repository is Repository => repository !== null);
};

const readRepositoryCache = (): RepositoryCache | null => {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? "null");
    if (!isRecord(value) || typeof value.fetchedAt !== "number" || !Array.isArray(value.repositories)) {
      return null;
    }

    const repositories = value.repositories
      .map(parseRepository)
      .filter((repository): repository is Repository => repository !== null);

    return repositories.length === value.repositories.length
      ? { fetchedAt: value.fetchedAt, repositories }
      : null;
  } catch {
    return null;
  }
};

const writeRepositoryCache = (cache: RepositoryCache) => {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Rendering fresh data is still preferable when storage is unavailable.
  }
};

let repositoryRequest: Promise<Repository[]> | null = null;

const fetchRepositories = () => {
  if (repositoryRequest) return repositoryRequest;

  repositoryRequest = fetch(REPOSITORIES_URL, { cache: "no-cache" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Repository data request failed (${response.status}).`);
      }

      const value: unknown = await response.json();
      return parseRepositories(value);
    })
    .finally(() => {
      repositoryRequest = null;
    });

  return repositoryRequest;
};

interface RepositoryCardProps {
  compactNumber: Intl.NumberFormat;
  language: Language;
  now: number;
  repository: Repository;
}

function RepositoryCard({ compactNumber, language, now, repository }: RepositoryCardProps) {
  const { messages } = useLanguage();

  return (
    <a
      className="repository-card"
      href={repository.htmlUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="repository-card-heading">
        <h3 className="repository-card-name">{repository.name}</h3>
        <ArrowUpRight className="repository-card-arrow" aria-hidden="true" />
      </div>

      <p className="repository-card-description">
        {repository.description || messages.repositories.noDescription}
      </p>

      <div className="repository-card-footer">
        <div className="repository-card-details">
          {repository.language ? (
            <span className="repository-card-language">
              <span
                className="repository-card-language-dot"
                style={{ backgroundColor: languageColors[repository.language] ?? "#8c959f" }}
                aria-hidden="true"
              />
              {repository.language}
            </span>
          ) : null}
          <span
            className="repository-card-stat"
            aria-label={`${repository.starsCount} ${messages.repositories.stars}`}
          >
            <Star aria-hidden="true" />
            {compactNumber.format(repository.starsCount)}
          </span>
          <span
            className="repository-card-stat"
            aria-label={`${repository.forksCount} ${messages.repositories.forks}`}
          >
            <GitFork aria-hidden="true" />
            {compactNumber.format(repository.forksCount)}
          </span>
        </div>

        <div className="repository-card-footer-meta">
          {repository.fork || repository.archived ? (
            <span className="repository-card-state">
              {repository.archived
                ? messages.repositories.archived
                : messages.repositories.fork}
            </span>
          ) : null}
          {!repository.fork && repository.pushedAt ? (
            <time className="repository-card-updated" dateTime={repository.pushedAt}>
              {formatRelativeUpdatedAt(repository.pushedAt, now, language)}
            </time>
          ) : null}
        </div>
      </div>
    </a>
  );
}

export function RepositoriesPreview() {
  const { language, messages } = useLanguage();
  const cachedRepositories = readRepositoryCache();
  const [repositories, setRepositories] = useState<Repository[]>(
    cachedRepositories?.repositories ?? [],
  );
  const [status, setStatus] = useState<"error" | "loading" | "ready">(
    cachedRepositories ? "ready" : "loading",
  );
  const [now, setNow] = useState(() => Date.now());
  const compactNumber = useMemo(
    () =>
      new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }),
    [language],
  );

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const cache = readRepositoryCache();
    if (cache && Date.now() - cache.fetchedAt < CACHE_MAX_AGE) return;

    let cancelled = false;
    void fetchRepositories()
      .then((nextRepositories) => {
        if (cancelled) return;
        setRepositories(nextRepositories);
        setStatus("ready");
        writeRepositoryCache({ fetchedAt: Date.now(), repositories: nextRepositories });
      })
      .catch(() => {
        if (!cancelled && repositories.length === 0) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [repositories.length]);

  return (
    <section id="repos" className="repositories-preview" aria-label={messages.repositories.sectionLabel}>
      <div className="container">
        <h2 className="projects-preview-title repositories-preview-title">
          <SparklesText>{messages.repositories.title}</SparklesText>
        </h2>

        {repositories.length > 0 ? (
          <div className="repositories-grid">
            {repositories.map((repository) => (
              <RepositoryCard
                compactNumber={compactNumber}
                key={repository.htmlUrl}
                language={language}
                repository={repository}
                now={now}
              />
            ))}
          </div>
        ) : null}

        {status === "loading" ? (
          <div
            className="repositories-grid"
            aria-label={messages.repositories.loading}
            aria-busy="true"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div className="repository-card repository-card--skeleton" key={index} aria-hidden="true" />
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <p className="repositories-message">
            {messages.repositories.unavailable}{" "}
            <a
              href={`https://github.com/${GITHUB_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            {messages.repositories.githubSuffix}
          </p>
        ) : null}
      </div>
    </section>
  );
}
