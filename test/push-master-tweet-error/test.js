/**
 * This test checks the happy path of a commit to the main branch (master)
 * which includes a new *.toot file.
 */

const assert = require("assert");
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
process.env.MASTODON_URL = "https://mastodon.example";

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
    headers: { authorization: "token secret123" },
  })
  .reply(
    200,
    JSON.stringify({
      files: [
        {
          status: "added",
          filename: "toots/cupcake-ipsum.toot",
        },
      ],
    }),
    { headers: { "content-type": "application/json" } },
  );

// post comment
githubMock
  .intercept({
    path: "/repos/joschi/toot-together/commits/0000000000000000000000000000000000000002/comments",
    method: "POST",
    headers: { authorization: "token secret123" },
    body: (body) => {
      const parsed = JSON.parse(body);
      console.log(parsed.body);
      tap.equal(
        parsed.body,
        "Errors:\n\n- Text character limit of 500 exceeded",
      );
      return true;
    },
  })
  .reply(201, JSON.stringify({}), {
    headers: { "content-type": "application/json" },
  });

nock("https://mastodon.example")
  .get("/api/v1/instance")
  .reply(200, {
    urls: {
      streaming_api: "wss://mastodon.example",
    },
  });

nock("https://mastodon.example").post("/api/v1/statuses").reply(422, {
  error: "Text character limit of 500 exceeded",
});

process.on("exit", (code) => {
  assert.equal(code, 1);
  assert.deepEqual(nock.pendingMocks(), []);
  mockAgent.assertNoPendingInterceptors();

  // above code exits with 1 (error), but tap expects 0.
  // Tap adds the "process.exitCode" property for that purpose.
  process.exitCode = 0;
});

require("../../lib");
