module.exports = toot;

const { createRestAPIClient } = require("masto");

const parseTootFileContent = require("../common/parse-toot-file-content");

async function toot({ mastodonCredentials }, tootFile) {
  const client = createRestAPIClient({
    url: mastodonCredentials.url,
    accessToken: mastodonCredentials.accessToken,
  });

  const toot = parseTootFileContent(tootFile.text);
  const poll =
    toot.poll == null
      ? null
      : {
          expiresIn: 24 * 60 * 60,
          options: toot.poll,
        };
  const result = await client.v1.statuses.create({
    visibility: "unlisted",
    status: toot.text,
    poll,
  });
  return {
    text: result.content,
    url: result.url,
  };
}
