/**
 * This test checks the happy path of a commit to the main branch (master)
 * which includes a new *.toot file.
 */

const assert = require("assert");

const tap = require("tap");

// SETUP
process.env.GITHUB_EVENT_NAME = "push";
process.env.GITHUB_REF = "refs/heads/patch";
process.env.GITHUB_EVENT_PATH = require.resolve("./event.json");
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

require("../../lib");
