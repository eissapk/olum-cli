import { exec, execSync } from "child_process";
import logger from "./logger";

const compile = mode => {
  const taskName = "compile";
  return new Promise(resolve => {
    logger(taskName, "start");
    if (mode === "development") {
      execSync("node compiler.js compile dev");
    } else if (mode === "production") {
      execSync("node compiler.js compile");
    }
    resolve();
    logger(taskName, "end");
  });
};

export default compile;