import gulp from "gulp";
import compile from "./compile";
import bundle from "./bundle";
import colors from "colors";
import logger from "./logger";

const watcher = gulp.watch(["./src/**/*"]);
const taskName = "watch";
let timeout;

const sequence = () => {
  console.log(colors.bgRed.white(taskName));
  if (typeof timeout != "undefined") clearTimeout(timeout);
  timeout = setTimeout(() => compile("development").then(() => bundle("development")), 1000);
};

const watch = () => {
  return new Promise((resolve, reject) => {
    try {
      logger(taskName, "start");
      watcher.on("change", sequence);
      logger(taskName, "end");
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};
export default watch;