module.exports = createCheckRun;

async function createCheckRun(
  { octokit, payload, startedAt, toolkit },
  newToots
) {
  const allTootsValid = newToots.every((toot) => toot.valid);

  // Check runs cannot be created if the pull request was created by a fork,
  // so we just log out the result.
  // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#permissions-for-the-github_token
  if (payload.pull_request.head.repo.fork) {
    for (const toot of newToots) {
      if (toot.valid) {
        toolkit.info(`### ✅ Valid

${toot.text}`);
      } else {
        toolkit.info(`### ❌ Invalid

${toot.text}

The above toot is ${toot.length - 500} characters too long`);
      }
    }
    process.exit(allTootsValid ? 0 : 1);
  }

  const response = await octokit.request(
    "POST /repos/{owner}/{repo}/check-runs",
    {
      headers: {
        accept: "application/vnd.github.antiope-preview+json",
      },
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      name: "preview",
      head_sha: payload.pull_request.head.sha,
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      status: "completed",
      conclusion: allTootsValid ? "success" : "failure",
      output: {
        title: `${newToots.length} toot(s)`,
        summary: newToots.map(tootToCheckRunSummary).join("\n\n---\n\n"),
      },
    }
  );

  toolkit.info(`check run created: ${response.data.html_url}`);
}

function tootToCheckRunSummary(toot) {
  let text = toot.text.replace(/(^|\n)/g, "$1> ");

  if (toot.poll && (toot.poll.length < 2 || toot.poll.length > 4)) {
    return `### ❌ Invalid

${text}

The toot includes a poll, but it has ${toot.poll.length} options. A poll must have 2-4 options.`;
  }

  if (toot.poll) {
    text +=
      "\n\nThe toot includes a poll:\n\n> 🔘 " + toot.poll.join("\n> 🔘 ");
  }

  if (toot.valid) {
    return `### ✅ Valid

${text}`;
  }

  return `### ❌ Invalid

${text}

The above toot is ${toot.length - 500} characters too long`;
}
