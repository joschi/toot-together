/**
 * This test checks the setup routine that occurs on a push to master
 * when the `toots/` folder does not yet exist, but there is a pending
 * pull request adding it already
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

// check if toot-together-setup branch exists
githubMock
  .intercept({
    path: "/repos/joschi/toot-together/git/refs/heads%2Ftoot-together-setup",
    method: "HEAD",
    headers: { authorization: "token secret123" },
  })
  .reply(200);

process.on("exit", (code) => {
  tap.equal(code, 0);
  mockAgent.assertNoPendingInterceptors();

  // for some reason, tap fails with "Suites:   1 failed" if we don't exit explicitly
  process.exit(0);
});

require("../../lib");
