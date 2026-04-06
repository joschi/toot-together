/**
 * This test checks the happy path of a commit to the main branch (master)
 * which includes a new *.toot file.
 */

const path = require("path");

const { MockAgent, setGlobalDispatcher } = require("undici");
const nock = require("nock");
const tap = require("tap");

// SETUP
process.env.GITHUB_EVENT_NAME = "push";
process.env.GITHUB_TOKEN = "secret123";
process.env.GITHUB_EVENT_PATH = require.resolve("./event.json");
process.env.GITHUB_REF = "refs/heads/master";
process.env.GITHUB_WORKSPACE = path.dirname(process.env.GITHUB_EVENT_PATH);

// set other env variables so action-toolkit is happy
process.env.GITHUB_WORKFLOW = "";
process.env.GITHUB_ACTION = "toot-together";
process.env.GITHUB_ACTOR = "";
process.env.GITHUB_REPOSITORY = "";
process.env.GITHUB_SHA = "";

// MOCK
const mockAgent = new MockAgent();
mockAgent.disableNetConnect();
setGlobalDispatcher(mockAgent);
const githubMock = mockAgent.get("https://api.github.com");

// get changed files
githubMock
  .intercept({
    path: "/repos/joschi/toot-together/compare/0000000000000000000000000000000000000001...0000000000000000000000000000000000000002",
    method: "GET",
  })
  .reply(
    200,
    JSON.stringify({
      files: [
        {
          status: "updated",
          filename: "toots/hello-world.toot",
        },
      ],
    }),
    { headers: { "content-type": "application/json" } },
  );

process.on("exit", (code) => {
  tap.equal(code, 0);
  mockAgent.assertNoPendingInterceptors();

  // for some reason, tap fails with "Suites:   1 failed" if we don't exit explicitly
  process.exit(0);
});

require("../../lib");
