/**
 * This test checks the happy path of pull request adding a new *.toot file
 */

const assert = require("assert");

const tap = require("tap");
const { mockGitHub, pendingMocks, setup } = require("../mock-github");
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
setup();
mockGitHub({
  reqheaders: {
    authorization: "token secret123",
  },
})
  // get changed files
  .get("/repos/joschi/toot-together/pulls/123/files")
  .reply(200, [
    {
      status: "updated",
      filename: "toots/hello-world.toot",
    },
  ]);

process.on("exit", (code) => {
  assert.equal(code, 0);
  assert.deepEqual(nock.pendingMocks(), []);
});

require("../../lib");
