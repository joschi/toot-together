const { readFileSync } = require("fs");

const { Octokit } = require("@octokit/action");
const toolkit = require("@actions/core");

const handlePullRequest = require("./pull-request");
const handlePush = require("./push");

const VERSION = require("../package.json").version;

console.log(`Running toot-together version ${VERSION}`);

main();

async function main() {
  const octokit = new Octokit();

  const payload = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"),
  );
  const ref = process.env.GITHUB_REF;
  const sha = process.env.GITHUB_SHA;

  const visibility = toolkit.getInput('visibility', { required: true }) || 'unlisted'

  const state = {
    toolkit,
    octokit,
    payload,
    ref,
    sha,
    startedAt: new Date().toISOString(),
    mastodonCredentials: {
      uri: process.env.MASTODON_URL,
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
