import { readFileSync } from "fs";
import { createRequire } from "module";

import { Octokit } from "@octokit/action";
import * as toolkit from "@actions/core";

import handlePullRequest from "./pull-request/index.js";
import handlePush from "./push/index.js";

const require = createRequire(import.meta.url);
const VERSION = require("../package.json").version;

console.log(`Running toot-together version ${VERSION}`);

await main();

async function main() {
  const octokit = new Octokit();

  const payload = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"),
  );
  const ref = process.env.GITHUB_REF;
  const sha = process.env.GITHUB_SHA;

  const visibility =
    toolkit.getInput("visibility", { required: false }) || "unlisted";

  const state = {
    toolkit,
    octokit,
    payload,
    ref,
    sha,
    startedAt: new Date().toISOString(),
    mastodonCredentials: {
      url: process.env.MASTODON_URL,
      accessToken: process.env.MASTODON_ACCESS_TOKEN,
    },
    visibility,
  };

  switch (process.env.GITHUB_EVENT_NAME) {
    case "push":
      await handlePush(state);
      break;
    case "pull_request":
      await handlePullRequest(state);
      break;
  }
}
