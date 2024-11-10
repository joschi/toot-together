module.exports = handlePullRequest;

const getNewToots = require("./get-new-toots");
const createCheckRun = require("./create-check-run");

async function handlePullRequest(state) {
  const { octokit, toolkit, payload } = state;

  // ignore builds from branches other than the repository’s default branch
  const base = payload.pull_request.base.ref;
  const defaultBranch = payload.repository.default_branch;
  if (defaultBranch !== base) {
    return toolkit.info(
      `Pull request base "${base}" is not the repository’s default branch`,
    );
  }

  // on request errors, log the requset options and error, then end process
  octokit.hook.error("request", (error) => {
    toolkit.info(error);
    toolkit.setFailed(error.stack);
    process.exit();
  });

  const newToots = await getNewToots(state);
  await createCheckRun(state, newToots);
}
