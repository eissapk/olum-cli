import shell from "shelljs";
import logger from "./logger";
import reload from "./reload";

const bundle = mode => {
  const taskName = "bundle";
  return new Promise((resolve, reject) => {
    try {
      logger(taskName, "start");
      if (mode === "development") shell.exec("webpack --env dev");
      else if (mode === "production") shell.exec("webpack");
      logger(taskName, "end");
      if (mode === "development") reload();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export default bundle;