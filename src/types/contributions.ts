export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface ContributionPayload {
  username: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  scope: string;
  totalContributions: number;
  restrictedContributionsCount: number;
  days: ContributionDay[];
}
