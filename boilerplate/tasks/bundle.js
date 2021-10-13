import { exec, execSync } from "child_process";
import logger from "./logger";
import reload from "./reload";

const bundle = mode => {
  const taskName = "bundle";
  return new Promise(resolve => {
    logger(taskName, "start");
    if (mode === "development") {
      execSync("webpack --env dev");
      reload();
    } else if (mode === "production") {
      execSync("webpack");
    }
    resolve();
    logger(taskName, "end");
  });
};

export default bundle;