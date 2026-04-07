/**
 * This test checks the setup routine that occurs on a push to master
 * when the `toots/` folder does not yet exist, but there is a pending
 * pull request adding it already
 */

import { dirname } from "path";
import assert from "assert";
import { fileURLToPath } from "url";

import { mockGitHub, pendingMocks, setup } from "../mock-github.js";
import nock from "nock";
import tap from "tap";

// SETUP
process.env.GITHUB_EVENT_NAME = "push";
process.env.GITHUB_TOKEN = "secret123";
process.env.GITHUB_EVENT_PATH = fileURLToPath(
  new URL("./event.json", import.meta.url),
);
process.env.GITHUB_REF = "refs/heads/master";
process.env.GITHUB_WORKSPACE = dirname(process.env.GITHUB_EVENT_PATH);

// set other env variables so action-toolkit is happy
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
  // check if toot-together-setup branch exists
  .head("/repos/joschi/toot-together/git/refs/heads%2Ftoot-together-setup")
  .reply(200);

process.on("exit", (code) => {
  assert.equal(code, 0);
  assert.deepEqual(nock.pendingMocks(), []);
});

await import("../../lib/index.js");
