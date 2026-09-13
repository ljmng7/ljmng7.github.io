import assert from "node:assert/strict";
import test from "node:test";
import { generateReleaseSnapshot, normalizeReleases } from "../scripts/fetch-github-releases.mjs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const release = (overrides = {}) => ({
  id: 1,
  tag_name: "v1.0.0",
  name: "MacMix 1.0.0",
  body: "Initial release",
  html_url: "https://github.com/ljmng7/MacMix/releases/tag/v1.0.0",
  published_at: "2026-01-01T00:00:00Z",
  created_at: "2026-01-01T00:00:00Z",
  prerelease: false,
  draft: false,
  ...overrides,
});

test("normalizes, filters drafts, and sorts releases newest first", () => {
  const result = normalizeReleases([
    release(),
    release({ id: 2, tag_name: "v1.1.0", published_at: "2026-02-01T00:00:00Z" }),
    release({ id: 3, tag_name: "v2.0.0", draft: true }),
  ]);

  assert.deepEqual(
    result.map(({ tag_name }) => tag_name),
    ["v1.1.0", "v1.0.0"],
  );
});

test("rejects malformed GitHub payloads", () => {
  assert.throws(() => normalizeReleases({}), /unexpected releases payload/);
  assert.throws(() => normalizeReleases([release({ id: "1" })]), /unexpected release payload/);
});

test("website CI fetches MacMix releases rather than the website repository", async (t) => {
  const folder = await mkdtemp(path.join(tmpdir(), "macmix-releases-"));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const previous = process.env.GITHUB_REPOSITORY;
  process.env.GITHUB_REPOSITORY = "ljmng7/ljmng7.github.io";
  t.after(() => {
    if (previous === undefined) delete process.env.GITHUB_REPOSITORY;
    else process.env.GITHUB_REPOSITORY = previous;
  });
  const destination = path.join(folder, "releases.json");
  await generateReleaseSnapshot({
    destination,
    token: "test-token",
    fetchImpl: async (url, options) => {
      assert.equal(url.pathname, "/repos/ljmng7/MacMix/releases");
      assert.equal(options.headers.Authorization, "Bearer test-token");
      return { ok: true, json: async () => [release()] };
    },
  });
  assert.equal(JSON.parse(await readFile(destination, "utf8"))[0].body, "Initial release");
});

test("API failures preserve the previous release snapshot", async (t) => {
  const folder = await mkdtemp(path.join(tmpdir(), "macmix-releases-"));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const destination = path.join(folder, "releases.json");
  await writeFile(destination, "previous snapshot");
  await assert.rejects(generateReleaseSnapshot({
    destination,
    fetchImpl: async () => ({ ok: false, status: 403, text: async () => "Rate limited" }),
  }), /snapshot failed with 403/);
  assert.equal(await readFile(destination, "utf8"), "previous snapshot");
});
