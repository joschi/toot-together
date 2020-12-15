 * This test checks the happy path of pull request adding a new *.toot file
process.env.GITHUB_ACTION = "toot-together";
  .get("/repos/joschi/toot-together/pulls/123/files")
      filename: "toots/hello-world.toot",
  .get("/repos/joschi/toot-together/pulls/123")
    `diff --git a/toots/progress.toot b/toots/progress.toot
+++ b/toots/hello-world.toot
+Cupcake ipsum dolor sit amet chupa chups candy halvah I love. Apple pie gummi bears chupa chups jujubes I love cake jelly. Jelly candy canes pudding jujubes caramels sweet roll I love. Sweet fruitcake oat cake I love brownie sesame snaps apple pie lollipop. Pie dragée I love apple pie cotton candy candy chocolate bar.
  .post("/repos/joschi/toot-together/check-runs", (body) => {
      title: "1 toot(s)",
        "### ❌ Invalid\n\n> Cupcake ipsum dolor sit amet chupa chups candy halvah I love. Apple pie gummi bears chupa chups jujubes I love cake jelly. Jelly candy canes pudding jujubes caramels sweet roll I love. Sweet fruitcake oat cake I love brownie sesame snaps apple pie lollipop. Pie dragée I love apple pie cotton candy candy chocolate bar.\n> Cupcake ipsum dolor sit amet chupa chups candy halvah I love. Apple pie gummi bears chupa chups jujubes I love cake jelly. Jelly candy canes pudding jujubes caramels sweet roll I love. Sweet fruitcake oat cake I love brownie sesame snaps apple pie lollipop. Pie dragée I love apple pie cotton candy candy chocolate bar.\n\nThe above toot is 139 characters too long",