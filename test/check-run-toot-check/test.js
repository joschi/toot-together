import tap from "tap";
import { EOL } from "os";

import parseTootFileContent from "../../lib/common/parse-toot-file-content.js";

tap.test("returns a valid toot when only text is provided", (t) => {
  const input = "Hello, world!";

  const result = parseTootFileContent(input);

  t.same(result.poll, null);
  t.equal(result.text, input);
  t.equal(result.valid, true);
  t.equal(result.length, input.length);
  t.end();
});

tap.test("extracts trailing poll options and preserves the toot body", (t) => {
  const input = ["Which snack?", "", "[ ] Chips", "[ ] Fruit"].join(EOL);

  const result = parseTootFileContent(input);

  t.same(result.poll, ["Chips", "Fruit"]);
  t.equal(result.text, "Which snack?");
  t.equal(result.valid, true);
  t.equal(result.length, "Which snack?".length);
  t.end();
});

tap.test(
  "counts URLs using Mastodon's fixed length when validating for long URLs",
  (t) => {
    const longUrl = `https://example.com/${"x".repeat(50)}`;
    const baseText = "x".repeat(476);
    const input = `${baseText} ${longUrl}`;

    const result = parseTootFileContent(input);

    t.same(result.poll, null);
    t.equal(result.text, input);
    t.equal(result.valid, true);
    t.equal(result.length, baseText.length + 1 + 23);
    t.end();
  },
);

tap.test(
  "counts URLs using Mastodon's fixed length when validating for short URLs",
  (t) => {
    const shortUrl = `http://example.com`;
    const baseText = "x".repeat(480);
    const input = `${baseText} ${shortUrl}`;

    const result = parseTootFileContent(input);

    t.same(result.poll, null);
    t.equal(result.text, input);
    t.equal(result.valid, false);
    t.equal(result.length, baseText.length + 1 + 23);
    t.end();
  },
);
