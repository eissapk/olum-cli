import OlumRouter from "olum-router";
import Home from "../views/home.js";
import About from "../views/about.js";

const routes = [ { path: "/", comp: Home }, { path: "/about", comp: About } ];

const router = new OlumRouter({ routes });

export default router;