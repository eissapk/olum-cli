import Olum from "olum";
import router from "./router/index.js";
import Home from "./views/home.js";

// new Olum().$("#app").use(Home); // use root component
new Olum().$("#app").use(router); // use router

// if ("serviceWorker" in navigator) { // uncomment to enable service worker when deploying
//   window.on("load", () => navigator.serviceWorker.register("/service-worker.js").catch(console.error));
// }