const publicAsset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;

export const profile = {
  name: "Jazmín",
  avatarUrl: publicAsset("avatar.png"),
  githubUrl: "https://github.com/ljmng7",
  githubIconUrl: publicAsset("figma-social-icons/github-original.svg")
} as const;
