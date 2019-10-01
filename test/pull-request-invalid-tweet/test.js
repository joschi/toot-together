const assert = require("assert");

const nock = require("nock");
const tap = require("tap");
process.env.GITHUB_EVENT_NAME = "pull_request";
process.env.GITHUB_TOKEN = "secret123";
process.env.GITHUB_EVENT_PATH = require.resolve("./event.json");
process.env.GITHUB_REF = "";
process.env.GITHUB_WORKSPACE = "";
process.env.GITHUB_WORKFLOW = "";
process.env.GITHUB_ACTION = "twitter-together";
process.env.GITHUB_ACTOR = "";
process.env.GITHUB_REPOSITORY = "";
process.env.GITHUB_SHA = "";
nock("https://api.github.com", {
    authorization: "token secret123"
  .get("/repos/gr2m/twitter-together/pulls/123/files")
      status: "added",
      filename: "tweets/hello-world.tweet"
  ]);
nock("https://api.github.com", {
    accept: "application/vnd.github.diff",
    authorization: "token secret123"
  .get("/repos/gr2m/twitter-together/pulls/123")
  .reply(
    200,
    `diff --git a/tweets/progress.tweet b/tweets/progress.tweet
+Cupcake ipsum dolor sit amet chupa chups candy halvah I love. Apple pie gummi bears chupa chups jujubes I love cake jelly. Jelly candy canes pudding jujubes caramels sweet roll I love. Sweet fruitcake oat cake I love brownie sesame snaps apple pie lollipop. Pie dragée I love apple pie cotton candy candy chocolate bar.`
  );
nock("https://api.github.com", {
    authorization: "token secret123"
  .post("/repos/gr2m/twitter-together/check-runs", body => {
    tap.equal(body.name, "twitter-together");
    tap.equal(body.head_sha, "0000000000000000000000000000000000000002");
    tap.equal(body.status, "completed");
    tap.equal(body.conclusion, "failure");
      title: "Preview: 1 tweet(s)",
      summary:
        "### ❌ Invalid\n\n> Cupcake ipsum dolor sit amet chupa chups candy halvah I love. Apple pie gummi bears chupa chups jujubes I love cake jelly. Jelly candy canes pudding jujubes caramels sweet roll I love. Sweet fruitcake oat cake I love brownie sesame snaps apple pie lollipop. Pie dragée I love apple pie cotton candy candy chocolate bar.\n\nThe above tweet is 39 characters too long"
    });
    return true;
  .reply(201);
process.on("exit", code => {
  assert.equal(code, 0);
  assert.deepEqual(nock.pendingMocks(), []);
});
require("../../lib");