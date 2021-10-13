import compile from "./compile";
import bundle from "./bundle";
import clean from "./clean";
import catchall from "./catchall";
import desktop from "./desktop";
import colors from "colors";

export default async function renderBuild() {
  try {
    await clean("dest"); // remove 'build' folder
    await compile("production");
    await bundle("production");
    await clean("src"); // remove '.pre-build' folder
    await catchall(); // catch all routes to fallback to root
    await desktop(); // package desktop app
    process.exitCode = 1;
  } catch (err) {
    console.log(colors.red.bold(err));
  }
}