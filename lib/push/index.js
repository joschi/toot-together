module.exports = handlePush;

const addComment = require("./add-comment");
const getNewToots = require("./get-new-toots");
const isSetupDone = require("./is-setup-done");
const setup = require("./setup");
const toot = require("./toots");

const parseTootFileContent = require("../common/parse-toot-file-content");

async function handlePush(state) {
  const { toolkit, octokit, payload, ref } = state;

  // ignore builds from tags
  if (!ref.startsWith("refs/heads/")) {
    toolkit.info(`GITHUB_REF is not a branch: ${ref}`);
    return;
  }

  // ignore builds from branches other than the repository’s defaul branch
  const defaultBranch = payload.repository.default_branch;
  const branch = process.env.GITHUB_REF.substr("refs/heads/".length);
  if (branch !== defaultBranch) {
    toolkit.info(`"${branch}" is not the default branch`);
    return;
  }

  // on request errors, log the requset options and error, then end process
  octokit.hook.error("request", (error, options) => {
    if (options.request.expectStatus === error.status) {
      throw error;
    }

    toolkit.info(error);
    toolkit.setFailed(error.stack);
    process.exit();
  });

  // make sure repository is already setup
  if (!(await isSetupDone())) {
    toolkit.info("toots/ folder does not yet exist. Starting setup");
    return setup(state);
  }

  // find toots
  const newToots = await getNewToots(state);
  if (newToots.length === 0) {
    toolkit.info("No new toots");
    return;
  }

  // post all the toots
  const tootUrls = [];
  const tootErrors = [];
  for (let i = 0; i < newToots.length; i++) {
    const { text, poll } = parseTootFileContent(newToots[i].text);
    toolkit.info(`Tooting: ${text}`);
    if (poll) {
      toolkit.info(
        `Toot has poll with ${poll.length} options: ${poll.join(", ")}`,
      );
    }

    try {
      const result = await toot(state, newToots[i]);

      toolkit.info(`tooted: ${result.url}`);
      tootUrls.push(result.url);
    } catch (error) {
      console.log(`error`);
      console.log(error);

      tootErrors.push(error);
    }
  }

  if (tootUrls.length) {
    await addComment(state, "Tooted:\n\n- " + tootUrls.join("\n- "));
  }

  if (tootErrors.length) {
    tootErrors.forEach(toolkit.error);
    await addComment(
      state,
      "Errors:\n\n- " + tootErrors.map((error) => error.message).join("\n- "),
    );
    return toolkit.setFailed("Error tooting");
  }
}
