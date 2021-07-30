import compile from "./compile";
import bundle from "./bundle";
import clean from "./clean";
import catchall from "./catchall";
import colors from "colors";

export default async function renderBuild() {
  try {
    await clean("dest"); // remove 'build' folder
    await compile("production");
    await bundle("production");
    await clean("src"); // remove '.pre-build' folder
    await catchall(); // catch all routes to fallback to root 
    setTimeout(() => process.exit(0), 1000); // handle this part later
  } catch (err) {
    console.log(colors.red.bold(err));
  }
}