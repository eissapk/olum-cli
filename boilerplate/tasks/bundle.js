import { exec } from "child_process";
import logger from "./logger";
import reload from "./reload";

const bundle = mode => {
  const taskName = "bundle";
  return new Promise((resolve, reject) => {
    logger(taskName, "start");
    if (mode === "development") {
      exec("webpack --env dev", (error, stdout, stderr) => {
        // if (stderr) return reject();
        reload();
        resolve();
      });
    } else if (mode === "production") {
      exec("webpack", (error, stdout, stderr) => {
        // if (stderr) return reject();
        resolve();
      });
    }
    logger(taskName, "end");
  });
};

export default bundle;
