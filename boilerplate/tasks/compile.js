import { exec } from "child_process";
import logger from "./logger";

const compile = mode => {
  const taskName = "compile";
  return new Promise((resolve, reject) => {
    logger(taskName, "start");
    if (mode === "development") {
      exec("node compiler.js compile dev", (error, stdout, stderr) => {
        if (error) return reject();
        resolve();
      });
    } else if (mode === "production") {
      exec("node compiler.js compile", (error, stdout, stderr) => {
        if (error) return reject();
        resolve();
      });
    }
    logger(taskName, "end");
  });
};

export default compile;
