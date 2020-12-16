/**
 * This test checks the setup routine that occurs on a push to master
 * when the `toots/` folder does not yet exist
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
process.env.GITHUB_SHA = "0000000000000000000000000000000000000002";

// set other env variables so action-toolkit is happy
process.env.GITHUB_WORKFLOW = "";
process.env.GITHUB_ACTION = "toot-together";
process.env.GITHUB_ACTOR = "";
process.env.GITHUB_REPOSITORY = "";

// MOCK
nock("https://api.github.com", {
  reqheaders: {
    authorization: "token secret123",
  },
})
  // check if toot-together-setup branch exists
  .head("/repos/joschi/toot-together/git/refs/heads%2Ftoot-together-setup")
  .reply(404)

  // Create the "toot-together-setup" branch
  .post("/repos/joschi/toot-together/git/refs", (body) => {
    tap.equal(body.ref, "refs/heads/toot-together-setup");
    tap.equal(body.sha, "0000000000000000000000000000000000000002");

    return true;
  })
  .reply(201)

  // Read contents of toots/README.md file in joschi/toot-together
  .get("/repos/joschi/toot-together/contents/toots%2FREADME.md")
  .reply(200, "contents of toots/README.md")

  // Create toots/README.md file
  .put("/repos/joschi/toot-together/contents/toots%2FREADME.md", (body) => {
    tap.equal(
      body.content,
      Buffer.from("contents of toots/README.md").toString("base64")
    );
    tap.equal(body.branch, "toot-together-setup");
    tap.equal(body.message, "toot-together setup");

    return true;
  })
  .reply(201)

  // Create pull request
  .post("/repos/joschi/toot-together/pulls", (body) => {
    tap.equal(body.title, "🐘 toot-together setup");
    tap.match(
      body.body,
      /This pull requests creates the `toots\/` folder where your `\*\.toot` files go into/
    );
    tap.equal(body.head, "toot-together-setup");
    tap.equal(body.base, "master");

    return true;
  })
  .reply(201, {
    html_url: "https://github.com/joschi/toot-together/pull/123",
  });

process.on("exit", (code) => {
  assert.equal(code, 0);
  assert.deepEqual(nock.pendingMocks(), []);
});

require("../../lib");
