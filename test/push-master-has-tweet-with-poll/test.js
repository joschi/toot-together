/**
 * This test checks the happy path of a commit to the main branch (master)
 * which includes a new *.toot file.
 */

const assert = require("assert");
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
nock("https://api.github.com", {
  reqheaders: {
    authorization: "token secret123",
  },
})
  // get changed files
  .get(
    "/repos/joschi/toot-together/compare/0000000000000000000000000000000000000001...0000000000000000000000000000000000000002"
  )
  .reply(200, {
    files: [
      {
        status: "added",
        filename: "toots/my-poll.toot",
      },
    ],
  })

  // post comment
  .post(
    "/repos/joschi/toot-together/commits/0000000000000000000000000000000000000002/comments",
    (body) => {
      tap.equal(body.body, "Tooted:\n\n- https://mastodon.example/@joschi/1");
      return true;
    }
  )
  .reply(201);

nock("https://mastodon.example")
  .get("/api/v1/instance")
  .reply(200, {
    urls: {
      streaming_api: "wss://mastodon.example",
    },
  });

nock("https://mastodon.example")
  .post("/api/v1/statuses", (body) => {
    tap.deepEquals(body.poll.options, [
      "option 1",
      "option 2",
      "option 3",
      "option 4",
    ]);
    tap.equal(body.status, "Here is my poll");
    return true;
  })
  .reply(200, {
    id: "1",
    uri: "https://mastodon.example/users/joschi/statuses/1",
    url: "https://mastodon.example/@joschi/1",
  });

process.on("exit", (code) => {
  assert.equal(code, 0);
  assert.deepEqual(nock.pendingMocks(), []);
});

require("../../lib");
