import { createRestAPIClient } from "masto";

import parseTootFileContent from "../common/parse-toot-file-content.js";

export default toot;

async function toot({ mastodonCredentials, visibility }, tootFile) {
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
    visibility,
    status: toot.text,
    poll,
  });
  return {
    text: result.content,
    url: result.url,
  };
}
