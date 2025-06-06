/**
 * This test checks the happy path of pull request adding a new *.toot file
 */

const assert = require("assert");

const nock = require("nock");
const tap = require("tap");

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
nock("https://api.github.com", {
  reqheaders: {
    authorization: "token secret123",
  },
})
  // get changed files
  .get("/repos/joschi/toot-together/pulls/123/files")
  .reply(200, [
    {
      status: "added",
      filename: "toots/hello-world.toot",
    },
  ]);

// get pull request diff
nock("https://api.github.com", {
  reqheaders: {
    accept: "application/vnd.github.diff",
    authorization: "token secret123",
  },
})
  .get("/repos/joschi/toot-together/pulls/123")
  .reply(
    200,
    `diff --git a/toots/progress.toot b/toots/progress.toot
new file mode 100644
index 0000000..0123456
--- /dev/null
+++ b/toots/hello-world.toot
@@ -0,0 +1,2 @@
+Cupcake ipsum dolor sit amet chupa chups candy halvah I love. Apple pie gummi bears chupa chups jujubes I love cake jelly. Jelly candy canes pudding jujubes caramels sweet roll I love. Sweet fruitcake oat cake I love brownie sesame snaps apple pie lollipop. Pie dragée I love apple pie cotton candy candy chocolate bar.
+Cupcake ipsum dolor sit amet chupa chups candy halvah I love. Apple pie gummi bears chupa chups jujubes I love cake jelly. Jelly candy canes pudding jujubes caramels sweet roll I love. Sweet fruitcake oat cake I love brownie sesame snaps apple pie lollipop. Pie dragée I love apple pie cotton candy candy chocolate bar.`,
  );

// create check run
nock("https://api.github.com", {
  reqheaders: {
    authorization: "token secret123",
  },
})
  .post("/repos/joschi/toot-together/check-runs", (body) => {
    tap.equal(body.name, "preview");
    tap.equal(body.head_sha, "0000000000000000000000000000000000000002");
    tap.equal(body.status, "completed");
    tap.equal(body.conclusion, "failure");
    tap.deepEqual(body.output, {
      title: "1 toot(s)",
      summary:
        "### ❌ Invalid\n\n> Cupcake ipsum dolor sit amet chupa chups candy halvah I love. Apple pie gummi bears chupa chups jujubes I love cake jelly. Jelly candy canes pudding jujubes caramels sweet roll I love. Sweet fruitcake oat cake I love brownie sesame snaps apple pie lollipop. Pie dragée I love apple pie cotton candy candy chocolate bar.\n> Cupcake ipsum dolor sit amet chupa chups candy halvah I love. Apple pie gummi bears chupa chups jujubes I love cake jelly. Jelly candy canes pudding jujubes caramels sweet roll I love. Sweet fruitcake oat cake I love brownie sesame snaps apple pie lollipop. Pie dragée I love apple pie cotton candy candy chocolate bar.\n\nThe above toot is 139 characters too long",
    });

    return true;
  })
  .reply(201);

process.on("exit", (code) => {
  assert.equal(code, 0);
  assert.deepEqual(nock.pendingMocks(), []);
});

require("../../lib");
