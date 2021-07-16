import shell from "shelljs";
import logger from "./logger";

const clean = () => {
  const taskName = "clean";
  return new Promise((resolve, reject) => {
    try {
      logger(taskName, "start");
      shell.exec("node compiler.js clean");
      logger(taskName, "end");
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export default clean;