module.exports = getNewToots;

const parseDiff = require("parse-diff");

const parseTootFileContent = require("../common/parse-toot-file-content");

async function getNewToots({ octokit, toolkit, payload }) {
  // Avoid loading huuuge diffs for pull requests that don’t create a new toot file
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{number}/files",
    {
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      number: payload.pull_request.number,
    }
  );

  const { data: files } = response;

  const newToot = files.find(
    (file) => file.status === "added" && /^toots\/.*\.toot$/.test(file.filename)
  );

  if (!newToot) {
    toolkit.info("Pull request does not include new toots");
    process.exit(0);
  }

  toolkit.info(`${files.length} files changed`);

  // We load the pull request diff in order to access the contents of the new toots from
  // pull requests coming from forks. The action does not have access to that git tree,
  // neither does the action’s token have access to the fork repository
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{number}",
    {
      headers: {
        accept: "application/vnd.github.diff",
      },
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      number: payload.pull_request.number,
    }
  );

  const newToots = parseDiff(data)
    .filter((file) => file.new && /^toots\/.*\.toot$/.test(file.to))
    .map((file) => {
      const tootFileContent = file.chunks[0].changes
        .map((line) => line.content.substr(1))
        .join("\n");

      return parseTootFileContent(tootFileContent);
    });

  toolkit.info(`New toots found: ${newToots.length}`);
  return newToots;
}
