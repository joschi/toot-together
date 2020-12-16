module.exports = toot;

const mastojs = require("masto");

const parseTootFileContent = require("../common/parse-toot-file-content");

function pollOption(title) {
  return { title: title };
}

async function toot({ mastodonCredentials }, tootFile) {
  const client = await mastojs.Masto.login({
    uri: mastodonCredentials.uri,
    accessToken: mastodonCredentials.accessToken,
  });

  const toot = parseTootFileContent(tootFile.text);
  const choices = toot.poll == null ? null : toot.poll.map(pollOption);
  const result = await client.createStatus({
    status: toot.text,
    choices,
  });
  return {
    text: result.status,
    url: result.url,
  };
}
