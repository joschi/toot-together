/**
 * This test checks the happy path of pull request adding a new *.toot file
 */

import assert from "assert";
import { fileURLToPath } from "url";

import tap from "tap";
import nock from "nock";

// SETUP
process.env.GITHUB_EVENT_NAME = "pull_request";
process.env.GITHUB_TOKEN = "secret123";
process.env.GITHUB_EVENT_PATH = fileURLToPath(
  new URL("./event.json", import.meta.url),
);

// set other env variables so action-toolkit is happy
process.env.GITHUB_REF = "";
process.env.GITHUB_WORKSPACE = "";
process.env.GITHUB_WORKFLOW = "";
process.env.GITHUB_ACTION = "toot-together";
process.env.GITHUB_ACTOR = "";
process.env.GITHUB_REPOSITORY = "";
process.env.GITHUB_SHA = "";

process.on("exit", (code) => {
  assert.equal(code, 0);
  assert.deepEqual(nock.pendingMocks(), []);
});

await import("../../lib/index.js");
