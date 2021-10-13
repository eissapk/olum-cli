import { exec } from "child_process";
import logger from "./logger";

const clean = dir => {
  const taskName = "clean";
  return new Promise((resolve, reject) => {
    logger(taskName, "start");
    exec(`node compiler.js clean ${dir}`, (error, stdout, stderr) => {
      if (error) return reject();
      resolve();
      logger(taskName, "end");
    });
  });
};

export default clean;
