# Release notes and Cloudflare Pages

The public `ljmng7/MacMix` GitHub Releases API is the source for website release
notes and the version badge. The App's private source is never copied to the site.
`MACMIX_RELEASE_REPOSITORY` may explicitly override the source; the CI runner's
`GITHUB_REPOSITORY` does not affect it.

## Cloudflare Pages project

Connect `ljmng7/ljmng7.github.io` and configure a separate MacMix Pages project:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Root directory | `macmix` |
| Build command | `npm run build:cloudflare` |
| Build output directory | `dist/client` |
| `NODE_VERSION` | `22` |
| `SITE_BASE` | `/` |
| Custom domain | `macmix.jazminli.com` |

Allow Cloudflare's GitHub integration access to the website repository. If using
build watch paths, include `macmix/**`. The build fetches the latest public notes
before Vite embeds the snapshot. No runtime API requests are needed. API errors
fail the build, leaving the last successful deployment in place. Ordinary local
`npm run build` stays offline and uses the saved snapshot.

## App-triggered rebuilds

In the MacMix Pages project create a production (`main`) Deploy Hook. Save its
URL as the GitHub Actions secret `MACMIX_PAGES_DEPLOY_HOOK` in `ljmng7/MacMix-Pro`.
Do not commit the URL or put it in browser code. It grants rebuild access only;
no cross-repository GitHub write token is needed.

Use `notify-website.yml` as `.github/workflows/pages.yml` in the App repository,
replacing the obsolete reusable workflow targeting the deleted `website` branch.
It rebuilds on main-branch pushes, release publication/edit/deletion, successful
completion of `Build, Notarize, and Release`, and manual dispatch. The successful
release-workflow trigger refreshes again after public releases have been uploaded,
even when a release was created by automation and a release event is suppressed.

To also rebuild after public Free-source commits or public release-note edits,
install the same workflow and Secret in `ljmng7/MacMix`. The `workflow_run` trigger
there is harmless when that repository has no matching release workflow.

App commits trigger a rebuild; only published GitHub Release bodies become notes.
The hook always builds the website repository's production branch, not App source.

## Activation and validation

1. Commit/push the website changes and the App workflow changes separately.
2. Create the MacMix Pages project and the Deploy Hook; save the Secret in each
   App repository where notifications are enabled.
3. Run `Rebuild MacMix website` manually and confirm its notification succeeds.
4. Check the new Cloudflare deployment's build log for the generated snapshot,
   then verify `/changelog` and the version badge on the production domain.

Until those external settings are complete, local tests validate the generator
and build only; live App-to-Cloudflare synchronization is not active.
