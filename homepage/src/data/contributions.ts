import type { ContributionPayload } from "../types/contributions";

const DATA_URL = `${import.meta.env.BASE_URL}data/github-contributions.json?v=rolling-26-weeks`;

let contributionRequest: Promise<ContributionPayload | null> | null = null;

const isContributionPayload = (value: unknown): value is ContributionPayload => {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<ContributionPayload>;
  return Array.isArray(payload.days) && typeof payload.totalContributions === "number";
};

export const loadContributionPayload = () => {
  if (contributionRequest) return contributionRequest;

  contributionRequest = fetch(DATA_URL, { cache: "no-cache" })
    .then((response) => (response.ok ? response.json() : null))
    .then((payload: unknown) => (isContributionPayload(payload) ? payload : null))
    .catch(() => null)
    .then((payload) => {
      if (!payload) contributionRequest = null;
      return payload;
    });

  return contributionRequest;
};
