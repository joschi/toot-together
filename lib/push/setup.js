module.exports = setup;

async function setup({ toolkit, octokit, payload, sha }) {
  toolkit.info('Checking if "toot-together-setup" branch exists already');

  try {
    // Check if "toot-together-setup" branch exists
    // https://developer.github.com/v3/git/refs/#get-a-reference
    await octokit.request("HEAD /repos/{owner}/{repo}/git/refs/{ref}", {
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      ref: "heads/toot-together-setup",
      request: {
        expectStatus: 404,
      },
    });

    // If it does, the script assumes that the setup pull requset already exists
    // and stops here
    return toolkit.info('"toot-together-setup" branch already exists');
  } catch (error) {
    toolkit.info('"toot-together-setup" branch does not yet exist');
  }

  // Create the "toot-together-setup" branch
  // https://developer.github.com/v3/git/refs/#create-a-reference
  await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    ref: "refs/heads/toot-together-setup",
    sha,
  });
  toolkit.info('"toot-together-setup" branch created');

  // Create toots/README.md from same file in joschi/toot-together repo
  // https://developer.github.com/v3/repos/contents/#get-contents
  const { data: readmeContent } = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      mediaType: {
        format: "raw",
      },
      owner: "joschi",
      repo: "toot-together",
      path: "toots/README.md",
    }
  );
  // https://developer.github.com/v3/repos/contents/#create-or-update-a-file
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    path: "toots/README.md",
    content: Buffer.from(readmeContent).toString("base64"),
    branch: "toot-together-setup",
    message: "toot-together setup",
  });
  toolkit.info('"toots/README.md" created in "toot-together-setup" branch');

  // Create pull request
  // https://developer.github.com/v3/pulls/#create-a-pull-request
  const { data: pr } = await octokit.request(
    "POST /repos/{owner}/{repo}/pulls",
    {
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      title: "🐘 toot-together setup",
      body: `This pull requests creates the \`toots/\` folder where your \`*.toot\` files go into. It also creates the \`toots/README.md\` file with instructions.

Enjoy!`,
      head: "toot-together-setup",
      base: payload.repository.default_branch,
    }
  );
  toolkit.info(`Setup pull request created: ${pr.html_url}`);
}
