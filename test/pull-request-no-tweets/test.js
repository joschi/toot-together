/**
 * This test checks the happy path of pull request adding a new *.toot file
 */

const tap = require("tap");
const { MockAgent, setGlobalDispatcher } = require("undici");
const nock = require("nock");

// SETUP
process.env.GITHUB_EVENT_NAME = "pull_request";
process.env.GITHUB_TOKEN = "secret123";
process.env.GITHUB_EVENT_PATH = require.resolve("./event.json");

// set other env variables so action-toolkit is happy
process.env.GITHUB_REF = "";
process.env.GITHUB_WORKSPACE = "";
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
    path: "/repos/joschi/toot-together/pulls/123/files",
    method: "GET",
    headers: { authorization: "token secret123" },
  })
  .reply(
    200,
    JSON.stringify([
      {
        status: "updated",
        filename: "toots/hello-world.toot",
      },
    ]),
    { headers: { "content-type": "application/json" } },
  );

process.on("exit", (code) => {
  tap.equal(code, 0);
  mockAgent.assertNoPendingInterceptors();
});

require("../../lib");
