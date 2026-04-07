/**
 * This test checks the happy path of a commit to the main branch (master)
 * which includes a new *.toot file.
 */

import { dirname } from "path";
import assert from "assert";
import { fileURLToPath } from "url";

import { mockGitHub, pendingMocks, setup } from "../mock-github.js";
import nock from "nock";
import tap from "tap";

// SETUP
process.env.GITHUB_EVENT_NAME = "push";
process.env.GITHUB_TOKEN = "secret123";
process.env.GITHUB_EVENT_PATH = fileURLToPath(
  new URL("./event.json", import.meta.url),
);
process.env.GITHUB_REF = "refs/heads/master";
process.env.GITHUB_WORKSPACE = dirname(process.env.GITHUB_EVENT_PATH);
process.env.MASTODON_URL = "https://mastodon.example";

// set other env variables so action-toolkit is happy
process.env.GITHUB_WORKFLOW = "";
process.env.GITHUB_ACTION = "toot-together";
process.env.GITHUB_ACTOR = "";
process.env.GITHUB_REPOSITORY = "";
process.env.GITHUB_SHA = "";

// MOCK
setup();
mockGitHub()
  // get changed files
  .get(
    "/repos/joschi/toot-together/compare/0000000000000000000000000000000000000001...0000000000000000000000000000000000000002",
  )
  .reply(500);

process.on("exit", (code) => {
  assert.equal(code, 1);
  assert.deepEqual(nock.pendingMocks(), []);

  // above code exits with 1 (error), but tap expects 0.
  // Tap adds the "process.exitCode" property for that purpose.
  process.exitCode = 0;
});

await import("../../lib/index.js");
