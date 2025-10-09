import { EOL } from "os";

const OPTION_REGEX = /^\[\s?\]\s+/;

export const TOOT_MAX_LENGTH = 500;

// Mastodon shortens URLs, so they take up less space.
const URL_CHARACTER_COUNT = 23;
const URL_PLACEHOLDER = "x".repeat(URL_CHARACTER_COUNT);
const URL_REGEX = /https?:\/\/\S+/gi;

function parseTootFileContent(text) {
  const pollOptions = [];
  let lastLine;
  while ((lastLine = getlastLineMatchingPollOption(text))) {
    pollOptions.push(lastLine.replace(OPTION_REGEX, ""));
    text = withLastLineRemoved(text);
  }

  const urlAwareLength = text.replace(URL_REGEX, URL_PLACEHOLDER).length;

  return {
    poll: pollOptions.length ? pollOptions.reverse() : null,
    text,
    valid: urlAwareLength > 0 && urlAwareLength <= TOOT_MAX_LENGTH,
    length: urlAwareLength,
  };
}

function getlastLineMatchingPollOption(text) {
  const lines = text.trim().split(EOL);
  const [lastLine] = lines.reverse();
  return OPTION_REGEX.test(lastLine) ? lastLine : null;
}

function withLastLineRemoved(text) {
  const lines = text.trim().split(EOL);
  return lines
    .slice(0, lines.length - 1)
    .join(EOL)
    .trim();
}

export default parseTootFileContent;
