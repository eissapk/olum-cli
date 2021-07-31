#!/usr/bin/env node
/**
 * @name Compiler.js
 * @version 0.0.6
 * @copyright 2021
 * @author Eissa Saber
 * @license MIT
 */
const commander = require("commander");
const cmd = new commander.Command();
const sass = require("sass");
const autoprefixer = require("autoprefixer");
const cssnano = require('cssnano');
const postcss = require("postcss");
const fs = require("fs");
const extra = require("fs-extra");
const path = require("path");
const colors = require("colors");
const settings = require("./settings");

// helpers
const isDebugging = false;
const debugLib = arg => (isDebugging ? console.log(arg) : "");
const quotes = (msg, color = "grey") => `'${colors[color].bold(msg)}'`;
const log = (type, path, err) => quotes(`${type} : ${path.replace(settings.src, "src")}`, "white") + "\n" + colors.red.bold(err);
const isObj = obj => !!(obj !== null && typeof obj === "object");
const isFullArr = arr => !!(isObj(arr) && Array.isArray(arr) && arr.length);
const isDef = val => !!(val !== undefined && val !== null);
const flatten = lists => lists.reduce((a, b) => a.concat(b), []);
const mkRegex = arr => {
  const pattern = arr.map(str => `${str.toLowerCase().trim()}|`).join("").slice(0, -1);
  const regex = new RegExp(pattern, "gi");
  return regex;
};

class Compiler {
  viewsDirs = ["components", "views"];
  regex = {
    template: {
      all: /<template[\s\S]*?>[\s\S]*?<\/template>/gi,
      tag: /<template[\s\S]*?>|<\/template>/gi,
    },
    script: {
      all: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      tag: /<script[\s\S]*?>|<\/script>/gi,
      curlyAfterClass: /(?<=export.*class.*)(\{)/,
    },
    style: {
      all: /<style[\s\S]*?>[\s\S]*?<\/style>/gi,
      tag: /<style[\s\S]*?>|<\/style>/gi,
      openTag: /<style[\s\S]*?>/gi,
    },
  };

  constructor() {
    cmd.command("clean [dir]").action(this.clean.bind(this));
    cmd.command("compile [mode]").action(this.init.bind(this));
    cmd.parse(process.argv);
  }

  getPaths(base = "src") {
    return new Promise((resolve, reject) => {
      const dirs = src => fs.readdirSync(src).map(item => path.join(src, item)).filter(item => fs.statSync(item).isDirectory());
      const recursive = src => [src, ...flatten(dirs(src).map(recursive))];
      const arr = recursive(base);
      
      // get all dirs 
      const directories = [...arr].filter(item => {
          const regex = mkRegex(this.viewsDirs);
          const result = regex.test(item);
          if (result) return item;
      });
      if (!isFullArr(directories)) return reject("No directories found !");
      const lastDir = directories[directories.length-1];

      // get all files 
      this.paths = [];
      directories.forEach((dir, index) => {
        fs.readdir(path.resolve(dir), (err, files) => {
          if (err) return reject(err);

          files.forEach((file, ind) => {
            const lastFile = files[files.length-1];
            const item = path.join(dir, file);
            if (!fs.statSync(item).isDirectory()) this.paths.push(item.trim().replace(/^src/, settings.src)); // push files only and exclude directories
            if (directories.indexOf(lastDir) === index && files.indexOf(lastFile) === ind) {
              const msg = `Created ${quotes("Paths", "blue")} Tree.`;
              debugLib(msg);
              resolve();
            }
          });
          
        });
      });

    });
  }

  clean(dir) {
    return new Promise((resolve, reject) => {
      if (dir === "src") { // clean src folder which is ".pre-build"
        if (fs.existsSync(settings.src)) { // if folder exists
          extra.remove(path.resolve(__dirname, settings.src), err => {
            if (err) return reject(err);
            const msg = `Deleted ${quotes(settings.src, "red")} Directory.`;
            debugLib(msg);
            resolve();
          });
        } else resolve();
      } else if (dir === "dest") { // clean dest folder which is "build"
        if (fs.existsSync(settings.dest)) { // if folder exists
          extra.remove(path.resolve(__dirname, settings.dest), err => {
            if (err) return reject(err);
            const msg = `Deleted ${quotes(settings.dest, "red")} Directory.`;
            debugLib(msg);
            resolve();
          });
        } else resolve();
      }
    });
  }

  copy() {
    return new Promise((resolve, reject) => {
      extra.copy(path.resolve(__dirname, "src"), path.resolve(__dirname, settings.src), err => {
        if (err) return reject(err);
        const msg = `Copied & renamed ${quotes("src", "green")} Directory → ${quotes(settings.src, "yellow")}`;
        debugLib(msg);
        resolve();
      });
    });
  }

  sharedStyle() {
    const file = path.resolve(__dirname, "src/styles/shared.scss");
    return new Promise((resolve, reject) => {
      if (fs.existsSync(file)) {
        fs.readFile(file, "utf8", (err, data) => {
          if (err) return reject(err);
          const msg = `Copied ${quotes("shared", "green")} Style.`;
          debugLib(msg);
          resolve(data.trim());
        });
      } else {
        resolve("");
      }
    });
  }

  compiledSharedStyle(shared) {
    const file = path.resolve(__dirname, "src/styles/shared.scss");
    return new Promise((resolve, reject) => {
      try {
        // compile sass to css 
        const compiled = sass.renderSync({ data: shared }).css.toString();
        const msg = `Compiled ${quotes("shared", "green")} Style.`;
        debugLib(msg);
        resolve(compiled);
      } catch (err) { // error related to Sass
        reject(log("Sass Compiler", file, err));
      }
    });
  }

  hasSASS(style) {
    const regex = new RegExp("lang=['\"]scss|sass['\"]", "gi");
    const openTagArr = style.match(this.regex.style.openTag);
    const openTag = isFullArr(openTagArr) ? openTagArr[0] : "";
    return regex.test(openTag);
  }

  /* stringify template litrals placeholder ${} before sass/postcss */
  stringify(string, file) {
    const regex = new RegExp(`(\\$\\{+[\\w|\\.]+\\})`, "gi"); // detects => ${}
    let arr = string.match(regex);
    arr = isFullArr(arr) ? arr : [];
    arr.forEach(item => {
      debugLib(`Stringified template litrals placeholder ${quotes(item, "red")} in <style> : ${quotes(file.trim().replace(settings.src, "src"), "yellow")}`);
      string = string.replace(regex, `"$1"`);
    });
    return string;
  }

  /* parse template litrals placeholder ${} after sass/postcss */
  parse(string, file) {
    const regex = new RegExp(`(\\s?\\"(\\$\\{+[\\w|\\.]+\\})\\"\\s?)`, "gi"); // detects => "${}"
    let arr = string.match(regex);
    arr = isFullArr(arr) ? arr : [];
    arr.forEach(item => {
      debugLib(`Parsed template litrals placeholder ${quotes(item, "green")} in <style> : ${quotes(file.trim().replace(settings.src, "src"), "yellow")}`);
      string = string.replace(regex, "$2");
    });
    return string;
  }

  css(file, data, shared, compiledShared) {
    return new Promise((resolve, reject) => {
      const styleArr = data.match(this.regex.style.all);
      const style = isFullArr(styleArr) ? styleArr[styleArr.length - 1] : ""; // get last style tag as the order of component file | because you may have style tag inside the class "script tag"
      let scss = style.replace(this.regex.style.tag, "");
      scss = this.stringify(scss, file);

      try {
        // compile sass to css 
        const css = this.hasSASS(style) ? sass.renderSync({ data: shared + scss }).css.toString() : compiledShared + scss;

        if (this.mode === "development") { // development
          const parsedDev = this.parse(css, file);
          resolve("\n style() { \n return `" + parsedDev + "`;\n}\n");

        } else if (this.mode === "production") { // production
          // prefix & minify css
          postcss([autoprefixer, cssnano]).process(css, { from: undefined }).then(result => {
            result.warnings().forEach(warn => console.warn(colors.yellow.bold(warn.toString())));
            const parsedBuild = this.parse(result.css, file);
            resolve("\n style() { \n return `" + parsedBuild + "`;\n}\n");
          }).catch(err => reject(log("PostCSS - [autoprefixer, cssnano]", file, err.reason + "\n" + err.showSourceCode())));
        }

      } catch (err) { // error related to Sass
        reject(log("Sass Compiler", file, err));
      }
    });
  }

  html(data) {
    return new Promise(resolve => {
      const tempArr = data.match(this.regex.template.all);
      const template = isFullArr(tempArr) ? tempArr[0] : ""; // get 1st template tag as the order of component file
      const markup = template.replace(this.regex.template.tag, "");
      const html = "\n template() { \n return `" + markup + "`;\n}\n";
      resolve(html);
    });
  }

  js(file, data) {
    return new Promise((resolve, reject) => {
      const scriptArr = data.match(this.regex.script.all);
      const script = isFullArr(scriptArr) ? scriptArr[0] : ""; // get 1st script tag as the order of component file
      const js = script.replace(this.regex.script.tag, "");
      const hasJsClass = this.regex.script.curlyAfterClass.test(js);
      if (hasJsClass) resolve(js);
      else reject(log("JS Class", file, "Couldn't find a class or opening curly bracket e.g. class Example '{' is followed with code"));
    });
  }

  modifyExt(file) {
    const arr = file.split(".");
    const ext = arr[arr.length - 1];
    return file.replace(ext, "") + "js";
  }

  merge(html, css, js) {
    return new Promise(resolve => {
      const file = js.replace(this.regex.script.curlyAfterClass, "{" + html + css);
      resolve(file);
    });
  }
  
  createFile(oldPath, newPath, compiledFile) {
    return new Promise((resolve, reject) => {
      fs.rename(oldPath, newPath, err => {
        if (err) return reject(err);
        fs.writeFile(newPath, compiledFile, err => {
          if (err) return reject(err);
          // debugLib("Created " + quotes(path.basename(newPath), "green"));
          resolve();
        });
      });
    });
  }

  update(shared, compiledShared) {
    if (isDef(this.paths) && isFullArr(this.paths)) {
      const recursive = num => {
        const file = this.paths[num].trim();
        const newPath = this.modifyExt(file);

        fs.readFile(file, "utf8", (err, data) => {
          if (err) return console.error(colors.red.bold(err));

          (async () => {
            try {
              const html = await this.html(data);
              const css = await this.css(file, data, shared, compiledShared);
              const js = await this.js(file, data);
              const compiledFile = await this.merge(html, css, js);
              await this.createFile(file, newPath, compiledFile);

              if (num + 1 <= this.paths.length - 1) recursive(num + 1); // next
            } catch (err) {
              console.error(err);
            }
          })();

        });
      };
      recursive(0);
    } else {
      const msg = `No ${quotes("components", "red")} to compile.`;
      console.warn(msg);
    }
  }

  async init(mode) {
    // detect mode 
    mode = typeof mode != "undefined" && mode === "dev" ? "development" : "production";
    this.mode = mode;
    debugLib(`Compiling in ${quotes(this.mode, "green")} mode...`);

    try {
      await this.getPaths("src");
      await this.clean("src");  // clean src folder which is ".pre-build"
      await this.copy();
      const shared = await this.sharedStyle();
      const compiledShared = await this.compiledSharedStyle(shared);
      this.update(shared, compiledShared);
      debugLib(`Updated ${quotes("Components", "green")}`);
    } catch (err) {
      console.error(colors.red.bold(err));
    }
  }
}

new Compiler();