import shell from "shelljs";
import logger from "./logger";

const compile = mode => {
  const taskName = "compile";
  return new Promise((resolve, reject) => {
    try {
      logger(taskName, "start");
      if (mode === "development") shell.exec("node compiler.js compile dev");
      else if (mode === "production") shell.exec("node compiler.js compile");
      logger(taskName, "end");
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export default compile;