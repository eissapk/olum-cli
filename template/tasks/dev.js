import compile from "./compile";
import bundle from "./bundle";
import watch from "./watch";
import server from "./server";
import colors from "colors";

export default async function renderDev() {
  try {
    await compile("development");
    await bundle("development");
    await watch();
    await server();
  } catch (err) {
    console.log(colors.red.bold(err));
  }
}