import connect from "gulp-connect";
import logger from "./logger";
import {olum as settings} from "../package.json";

const server = () => {
  const taskName = "server";
  return new Promise((resolve, reject) => {
    try {
      logger(taskName, "start");
      const options = {
        root: `./${settings.dest}`,
        port: process.env.PORT || settings.port,
        livereload: settings.livereload,
        https: settings.https,
        fallback: `./${settings.dest + settings.fallback}`,
      };
      connect.server(options);
      logger(taskName, "end");
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export default server;