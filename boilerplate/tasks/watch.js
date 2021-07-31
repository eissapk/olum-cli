import gulp from "gulp";
import compile from "./compile";
import bundle from "./bundle";
import colors from "colors";
import logger from "./logger";

const watcher = gulp.watch(["./src/**/*"]);
const taskName = "watch";
const watchSequence = [];

const sequence = () => {
  console.log(colors.bgRed.white(taskName));
  watchSequence.forEach(clearTimeout); // clear watch sequence
  const timeout = setTimeout(() => compile("development").then(() => bundle("development")), 1000);
  watchSequence.push(timeout);
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