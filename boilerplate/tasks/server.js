import connect from "gulp-connect";
import openurl from "openurl";
import logger from "./logger";
import { dest, port, livereload, https, fallback } from "../settings";

const server = () => {
  const taskName = "server";
  return new Promise((resolve, reject) => {
    try {
      logger(taskName, "start");
      const options = {
        root: `./${dest}`,
        port: process.env.PORT || port,
        livereload,
        https,
        fallback: `./${dest + fallback}`,
      };
      connect.server(options);
      openurl.open(`${https ? "https" : "http"}://localhost:${options.port}`);

      //! pure
      // const server = http.createServer((req, res) => {
      //   if (req.url === "/olumapp.js") {
      //     fs.readFile(path.resolve(__dirname, "../build/olumapp.js"), (err, content) => {
      //       if (err) console.log(err);
      //       res.writeHead(200, { "Content-Type": "text/javascript" });
      //       res.write(content);
      //     });
      //   }
      //   if (req.url === "/") {
      //     fs.readFile(path.resolve(__dirname, "../build/index.html"), (err, content) => {
      //       if (err) console.log(err);
      //       res.writeHead(200, { "Content-Type": "text/html" });
      //       res.end(content);
      //     });
      //   }
      // });
      // const PORT = process.env.PORT || 8000;
      // server.listen(PORT, () => {
      //   const domain = `http://localhost:${PORT}`;
      //   console.log(`Serving ${domain}`);
      // });

      logger(taskName, "end");
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

export default server;