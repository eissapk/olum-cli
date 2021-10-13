import { exec, execSync } from "child_process";
import logger from "./logger";

const clean = dir => {
  const taskName = "clean";
  return new Promise(resolve => {
    logger(taskName, "start");
    execSync(`node compiler.js clean ${dir}`);
    logger(taskName, "end");
    resolve();
  });
};

export default clean;