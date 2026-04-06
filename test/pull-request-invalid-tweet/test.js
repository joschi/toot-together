/**
 * This test checks the happy path of pull request adding a new *.toot file
 */

const assert = require("assert");

const { MockAgent, setGlobalDispatcher } = require("undici");
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
        status: "added",
        filename: "toots/hello-world.toot",
      },
    ]),
    { headers: { "content-type": "application/json" } },
  );

// get pull request diff
githubMock
  .intercept({
    path: "/repos/joschi/toot-together/pulls/123",
    method: "GET",
    headers: {
      accept: "application/vnd.github.diff",
      authorization: "token secret123",
    },
  })
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
githubMock
  .intercept({
    path: "/repos/joschi/toot-together/check-runs",
    method: "POST",
    headers: { authorization: "token secret123" },
    body: (body) => {
      const parsed = JSON.parse(body);
      tap.equal(parsed.name, "preview");
      tap.equal(parsed.head_sha, "0000000000000000000000000000000000000002");
      tap.equal(parsed.status, "completed");
      tap.equal(parsed.conclusion, "failure");
      tap.deepEqual(parsed.output, {
        title: "1 toot(s)",
        summary:
          "### ❌ Invalid\n\n> Cupcake ipsum dolor sit amet chupa chups candy halvah I love. Apple pie gummi bears chupa chups jujubes I love cake jelly. Jelly candy canes pudding jujubes caramels sweet roll I love. Sweet fruitcake oat cake I love brownie sesame snaps apple pie lollipop. Pie dragée I love apple pie cotton candy candy chocolate bar.\n> Cupcake ipsum dolor sit amet chupa chups candy halvah I love. Apple pie gummi bears chupa chups jujubes I love cake jelly. Jelly candy canes pudding jujubes caramels sweet roll I love. Sweet fruitcake oat cake I love brownie sesame snaps apple pie lollipop. Pie dragée I love apple pie cotton candy candy chocolate bar.\n\nThe above toot is 139 characters too long",
      });
      return true;
    },
  })
  .reply(201, JSON.stringify({}), {
    headers: { "content-type": "application/json" },
  });

process.on("exit", (code) => {
  assert.equal(code, 0);
  mockAgent.assertNoPendingInterceptors();
});

require("../../lib");
