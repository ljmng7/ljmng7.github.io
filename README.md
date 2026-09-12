# Jazmín websites

Three independent sites share this repository. Each site owns its source,
public assets, dependencies, lockfile, and production output.

| Directory | Intended domain (not configured here) | Build output |
| --- | --- | --- |
| `homepage/` | jazminli.com | `homepage/dist/` |
| `yumchicken/` | yumchicken.jazminli.com | `yumchicken/dist/` |
| `macmix/` | macmix.jazminli.com | `macmix/dist/client/` |

## Development

Use Node.js 22.12+ and npm. From the repository root:

```sh
npm run install:sites
npm run dev             # Homepage, http://localhost:5173
npm run dev:yumchicken  # YumChicken, http://localhost:5174
npm run dev:macmix      # MacMix, http://localhost:5175
```

Run each dev command in its own terminal. You can also run `npm ci`,
`npm run dev`, and `npm run build` directly inside any site directory.

```sh
npm run build          # Build all three sites
npm run typecheck      # TypeScript checks for both React sites
npm test               # Hello timeline and MacMix release/hosting tests
```

## Pages and ownership

- Homepage `/`: gradient and multilingual handwriting introduction only.
- Homepage `/play`: the original interactive MacBook and stickers with the
  shared navigation. The Play navigation has no gradient background.
- Homepage WORK and CONTACT are unlinked text placeholders. PLAY is hidden on mobile.
- YumChicken `/`, `/privacy.html`, and `/support.html` retain the product content
  and resolve their media from their own `public/assets/`. Author links return
  to `https://jazminli.com/`.
- MacMix was copied from the `Website/` directory of the local MacMix-Website
  project. The original project is untouched. Its license, release snapshot,
  routes, media, tests, and Sites-compatible build plumbing are preserved.

## Automation

The existing Pages workflow validates all three builds but still publishes only
`homepage/dist/`. No DNS, CNAME, or subdomain deployment has been configured.
GitHub profile-data synchronization now runs from `homepage/` and writes to
`homepage/public/data/`. MacMix's release snapshot can be refreshed separately
with `npm --prefix macmix run releases:snapshot`.
