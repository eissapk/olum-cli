import shell from "shelljs";
import logger from "./logger";

const clean = dir => {
  const taskName = "clean";
  return new Promise((resolve, reject) => {
    try {
      logger(taskName, "start");
      shell.exec(`node compiler.js clean ${dir}`);
      logger(taskName, "end");
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export default clean;