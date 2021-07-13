import { Olum } from "olum";
import Home from "./views/home.js";

const routes = [{ path: "/", comp: Home }];

export const olum = new Olum({
  mode: "history",
  root: "/",
  el: "#app",
  routes,
});