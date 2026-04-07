import fs from "fs";
import { resolve as resolvePath } from "path";

export default isSetupDone;

function isSetupDone() {
  const tootsFolderPath = resolvePath(process.env.GITHUB_WORKSPACE, "toots");
  return new Promise((resolve) => {
    fs.stat(tootsFolderPath, (error, stat) => {
      if (error) {
        return resolve(false);
      }

      resolve(stat.isDirectory());
    });
  });
}
