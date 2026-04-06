/**
 * This test checks the setup routine that occurs on a push to master
 * when the `toots/` folder does not yet exist
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
process.env.GITHUB_SHA = "0000000000000000000000000000000000000002";

// set other env variables so action-toolkit is happy
process.env.GITHUB_WORKFLOW = "";
process.env.GITHUB_ACTION = "toot-together";
process.env.GITHUB_ACTOR = "";
process.env.GITHUB_REPOSITORY = "";

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
  .reply(404);

// Create the "toot-together-setup" branch
githubMock
  .intercept({
    path: "/repos/joschi/toot-together/git/refs",
    method: "POST",
    headers: { authorization: "token secret123" },
    body: (body) => {
      const parsed = JSON.parse(body);
      tap.equal(parsed.ref, "refs/heads/toot-together-setup");
      tap.equal(parsed.sha, "0000000000000000000000000000000000000002");
      return true;
    },
  })
  .reply(201, JSON.stringify({}), {
    headers: { "content-type": "application/json" },
  });

// Read contents of toots/README.md file in joschi/toot-together
githubMock
  .intercept({
    path: "/repos/joschi/toot-together/contents/toots%2FREADME.md",
    method: "GET",
    headers: { authorization: "token secret123" },
  })
  .reply(200, "contents of toots/README.md");

// Create toots/README.md file
githubMock
  .intercept({
    path: "/repos/joschi/toot-together/contents/toots%2FREADME.md",
    method: "PUT",
    headers: { authorization: "token secret123" },
    body: (body) => {
      const parsed = JSON.parse(body);
      tap.equal(
        parsed.content,
        Buffer.from("contents of toots/README.md").toString("base64"),
      );
      tap.equal(parsed.branch, "toot-together-setup");
      tap.equal(parsed.message, "toot-together setup");
      return true;
    },
  })
  .reply(201, JSON.stringify({}), {
    headers: { "content-type": "application/json" },
  });

// Create pull request
githubMock
  .intercept({
    path: "/repos/joschi/toot-together/pulls",
    method: "POST",
    headers: { authorization: "token secret123" },
    body: (body) => {
      const parsed = JSON.parse(body);
      tap.equal(parsed.title, "🐘 toot-together setup");
      tap.match(
        parsed.body,
        /This pull requests creates the `toots\/` folder where your `\*\.toot` files go into/,
      );
      tap.equal(parsed.head, "toot-together-setup");
      tap.equal(parsed.base, "master");
      return true;
    },
  })
  .reply(
    201,
    JSON.stringify({
      html_url: "https://github.com/joschi/toot-together/pull/123",
    }),
    { headers: { "content-type": "application/json" } },
  );

process.on("exit", (code) => {
  assert.equal(code, 0);
  mockAgent.assertNoPendingInterceptors();
});

require("../../lib");
