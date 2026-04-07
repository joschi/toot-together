import { resolve as resolvePath } from "path";
import { readFileSync } from "fs";

export default getNewToots;

async function getNewToots({ payload, octokit }) {
  const {
    data: { files },
  } = await octokit.request(
    "GET /repos/{owner}/{repo}/compare/{base}...{head}",
    {
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      base: payload.before,
      head: payload.after,
    },
  );

  return files
    .filter(
      (file) =>
        file.status === "added" && /^toots\/.*\.toot$/.test(file.filename),
    )
    .map((file) => {
      const text = readFileSync(
        resolvePath(process.env.GITHUB_WORKSPACE, file.filename),
        "utf8",
      ).trim();
      return {
        text,
        filename: file.filename,
      };
    });
}
