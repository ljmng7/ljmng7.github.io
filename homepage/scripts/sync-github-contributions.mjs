import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const username = "ljmng7";
const outputPath = resolve(process.cwd(), "public/data/github-contributions.json");
const token = process.env.GITHUB_TOKEN?.trim();
const now = new Date();
const columns = 26;
const rows = 7;
const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});
const todayKey = dateFormatter.format(now);
const today = new Date(`${todayKey}T00:00:00Z`);
const gridEnd = new Date(today);
gridEnd.setUTCDate(gridEnd.getUTCDate() + (6 - gridEnd.getUTCDay()));
const gridStart = new Date(gridEnd);
gridStart.setUTCDate(gridStart.getUTCDate() - (columns * rows - 1));

if (!token) {
  throw new Error("GITHUB_TOKEN is required to fetch the GitHub contribution calendar.");
}

const query = `
  query ContributionCalendar($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        restrictedContributionsCount
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": `${username}-portfolio-contribution-sync`,
    "X-GitHub-Api-Version": "2022-11-28"
  },
  body: JSON.stringify({
    query,
    variables: {
      login: username,
      from: `${gridStart.toISOString().slice(0, 10)}T00:00:00+08:00`,
      to: `${gridEnd.toISOString().slice(0, 10)}T23:59:59+08:00`
    }
  })
});

if (!response.ok) {
  const detail = await response.text();
  throw new Error(`GitHub GraphQL request failed (${response.status}): ${detail}`);
}

const result = await response.json();

if (Array.isArray(result.errors) && result.errors.length > 0) {
  throw new Error(`GitHub GraphQL request failed: ${JSON.stringify(result.errors)}`);
}

const collection = result.data?.user?.contributionsCollection;
const calendar = collection?.contributionCalendar;

if (!calendar || !Array.isArray(calendar.weeks)) {
  throw new Error(`No contribution calendar was returned for ${username}.`);
}

const levelValues = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4
};
const calendarDays = new Map(
  calendar.weeks.flatMap((week) => week.contributionDays || []).map((day) => [day.date, day])
);
const pad = (value) => String(value).padStart(2, "0");
const toDateKey = (date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
const days = [];
const cursor = new Date(gridStart);

while (cursor <= gridEnd) {
  const date = toDateKey(cursor);
  const contribution = calendarDays.get(date);
  const contributionLevel = contribution?.contributionLevel || "NONE";

  if (!(contributionLevel in levelValues)) {
    throw new Error(`Unknown GitHub contribution level: ${contributionLevel}`);
  }

  days.push({
    date,
    count: Number(contribution?.contributionCount) || 0,
    level: levelValues[contributionLevel]
  });
  cursor.setUTCDate(cursor.getUTCDate() + 1);
}

let previous = null;
try {
  previous = JSON.parse(await readFile(outputPath, "utf8"));
} catch {}

const totalContributions = Number(calendar.totalContributions) || 0;
const restrictedContributionsCount = Number(collection.restrictedContributionsCount) || 0;
const dataChanged =
  JSON.stringify(previous?.days) !== JSON.stringify(days) ||
  previous?.totalContributions !== totalContributions ||
  previous?.restrictedContributionsCount !== restrictedContributionsCount;
const payload = {
  username,
  startDate: toDateKey(gridStart),
  endDate: toDateKey(gridEnd),
  generatedAt: dataChanged ? now.toISOString() : previous?.generatedAt || now.toISOString(),
  scope: "rolling 26-week GitHub contribution calendar, including anonymized restricted contributions when profile visibility allows",
  totalContributions,
  restrictedContributionsCount,
  days
};

await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(
  `Synced ${totalContributions} official GitHub contributions from ${toDateKey(gridStart)} to ${toDateKey(gridEnd)}, including ${restrictedContributionsCount} restricted contributions.`
);
