/**
 * This test checks the happy path of a commit to the main branch (master)
 * which includes a new *.toot file.
 */

import assert from "assert";
import { fileURLToPath } from "url";

import tap from "tap";

// SETUP
process.env.GITHUB_EVENT_NAME = "push";
process.env.GITHUB_REF = "refs/tags/v1.0.0";
process.env.GITHUB_EVENT_PATH = fileURLToPath(
  new URL("./event.json", import.meta.url),
);
process.env.GITHUB_TOKEN = "secret123";

// set other env variables so action-toolkit is happy
process.env.GITHUB_WORKSPACE = "";
process.env.GITHUB_WORKFLOW = "";
process.env.GITHUB_ACTION = "toot-together";
process.env.GITHUB_ACTOR = "";
process.env.GITHUB_REPOSITORY = "";
process.env.GITHUB_SHA = "";

process.on("exit", (code) => {
  assert.equal(code, 0);
});

await import("../../lib/index.js");
