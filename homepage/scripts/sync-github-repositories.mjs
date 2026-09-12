import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const username = "ljmng7";
const outputPath = resolve(process.cwd(), "public/data/github-repositories.json");
const token = process.env.GITHUB_TOKEN?.trim();
const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": `${username}-portfolio-repository-sync`,
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const fetchRepositoryPage = async (page) => {
  const url = new URL(`https://api.github.com/users/${username}/repos`);
  url.searchParams.set("type", "owner");
  url.searchParams.set("sort", "pushed");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("per_page", "100");
  url.searchParams.set("page", String(page));

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub repository request failed (${response.status}): ${detail}`);
  }

  const repositories = await response.json();
  if (!Array.isArray(repositories)) {
    throw new Error(`GitHub returned an unexpected repository response for ${username}.`);
  }

  return repositories;
};

const rawRepositories = [];
for (let page = 1; ; page += 1) {
  const repositories = await fetchRepositoryPage(page);
  rawRepositories.push(...repositories);
  if (repositories.length < 100) break;
}

const repositories = rawRepositories.map((repository) => {
  if (
    typeof repository?.name !== "string" ||
    typeof repository?.html_url !== "string" ||
    typeof repository?.fork !== "boolean" ||
    typeof repository?.archived !== "boolean" ||
    typeof repository?.stargazers_count !== "number" ||
    typeof repository?.forks_count !== "number"
  ) {
    throw new Error(`GitHub returned an invalid repository entry for ${username}.`);
  }

  return {
    name: repository.name,
    htmlUrl: repository.html_url,
    description: typeof repository.description === "string" ? repository.description : null,
    language: typeof repository.language === "string" ? repository.language : null,
    starsCount: repository.stargazers_count,
    forksCount: repository.forks_count,
    fork: repository.fork,
    archived: repository.archived,
    pushedAt: typeof repository.pushed_at === "string" ? repository.pushed_at : null,
  };
});

let previous = null;
try {
  previous = JSON.parse(await readFile(outputPath, "utf8"));
} catch {}

const now = new Date();
const dataChanged = JSON.stringify(previous?.repositories) !== JSON.stringify(repositories);
const payload = {
  username,
  generatedAt: dataChanged ? now.toISOString() : previous?.generatedAt || now.toISOString(),
  scope: "all public repositories owned by the GitHub user, including forks",
  repositories,
};

await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Synced ${repositories.length} public GitHub repositories for ${username}.`);
