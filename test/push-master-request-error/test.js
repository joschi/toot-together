/**
 * This test checks the happy path of a commit to the main branch (master)
 * which includes a new *.toot file.
 */

const path = require("path");

const nock = require("nock");
const tap = require("tap");

// SETUP
process.env.GITHUB_EVENT_NAME = "push";
process.env.GITHUB_TOKEN = "secret123";
process.env.GITHUB_EVENT_PATH = require.resolve("./event.json");
process.env.GITHUB_REF = "refs/heads/master";
process.env.GITHUB_WORKSPACE = path.dirname(process.env.GITHUB_EVENT_PATH);
process.env.MASTODON_URL = "https://mastodon.example";

// set other env variables so action-toolkit is happy
process.env.GITHUB_WORKFLOW = "";
process.env.GITHUB_ACTION = "toot-together";
process.env.GITHUB_ACTOR = "";
process.env.GITHUB_REPOSITORY = "";
process.env.GITHUB_SHA = "";

// MOCK
nock("https://api.github.com")
  // get changed files
  .get(
    "/repos/joschi/toot-together/compare/0000000000000000000000000000000000000001...0000000000000000000000000000000000000002",
  )
  .reply(500);

process.on("exit", (code) => {
  tap.equal(code, 1);
  tap.deepEqual(nock.pendingMocks(), []);

  // above code exits with 1 (error), but tap expects 0.
  // Tap adds the "process.exitCode" property for that purpose.
  process.exitCode = 0;
});

require("../../lib");
