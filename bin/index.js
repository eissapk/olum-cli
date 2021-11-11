#!/usr/bin/env node
/**
 * @name olum-cli
 * @copyright 2021
 * @author Eissa Saber
 * @license MIT
 */

// check node version
const requiredNodeMajorVer = +require("../package.json").engines.node.replace(/\<|\>|\=/gi,"").split(".")[0];
const currentNodeMajorVer = +process.version.replace(/v/gi, "").split(".")[0];
if (currentNodeMajorVer < requiredNodeMajorVer) {
  console.error(`\nYour node version is "${currentNodeMajorVer}" which is not compatible with 'olum-cli', Please upgrade to "${requiredNodeMajorVer}" or higher\n`);
  process.exit(1);
}

const commander = require("commander");
const cmd = new commander.Command();
const inquirer = require("inquirer");
const download = require("download-git-repo");
const fs = require("fs");
const colors = require("colors");
const { exec } = require("child_process");
const pkgJSON = require("../package.json");

// helpers
const isObj = obj => !!(obj !== null && typeof obj === "object");
const isFullArr = arr => !!(isObj(arr) && Array.isArray(arr) && arr.length);
const isDef = val => !!(val !== undefined && val !== null);

class CLI {
  hasHelpers = false;
  constructor() {
    cmd.version(pkgJSON.version);
    cmd.on("command:*", operands => {
      console.error(colors.red(`error: unknown command '${operands[0]}'\n Try running olum --help`));
      process.exitCode = 1;
    });
    cmd.on("--help", this.guide.bind(this));
    cmd.command("create").arguments("<name>").action(this.create.bind(this));
    cmd.parse(process.argv);
  }

  random(arr) {
    if (isFullArr(arr)) return Math.floor(Math.random() * arr.length);
  }

  guide() {
    const shorthand = pkgJSON.olum;
    // title colors
    const titleArr = shorthand.colors.title;
    const randomColor = titleArr[this.random(titleArr)];
    // signature shapes
    const signatureArr = shorthand.signature;
    const randomSignature = signatureArr[this.random(signatureArr)];

    const commands = `
    ${colors[randomColor].bold(randomSignature)} 
    ${pkgJSON.description} @${pkgJSON.version}

    ${colors[randomColor].bold(shorthand.commands.title)}
      ${colors[shorthand.colors.command](shorthand.commands.help.cmd)} ${shorthand.commands.help.desc}
      ${colors[shorthand.colors.command](shorthand.commands.version.cmd)} ${shorthand.commands.version.desc}
      ${colors[shorthand.colors.command](shorthand.commands.create.cmd)} ${shorthand.commands.create.desc}
      ${colors[shorthand.colors.command](shorthand.commands.update.cmd)} ${shorthand.commands.update.desc}
      ${colors[shorthand.colors.command](shorthand.commands.dev.cmd)} ${shorthand.commands.dev.desc}
      ${colors[shorthand.colors.command](shorthand.commands.build.cmd)} ${shorthand.commands.build.desc}

    ${colors[randomColor].bold(shorthand.docs.title)} ${colors.cyan(shorthand.docs.url)}
    `;
    console.clear();
    console.log(commands);
  }

  clone(name, branch) {
    this.loader("Generating boilerplate");
    const repo = "https://github.com/olumjs/olum-starter.git";
    return new Promise((resolve, reject) => {
      download(`direct:${repo}#${branch}`, `./${name}`, { clone: true }, err => {
        if (err) return reject("Error while cloning starter code \n" + err);
        
        if (this.hasHelpers) {
          fs.readFile(`./${name}/package.json`, "utf8", (err, data) => {
            if (err) return reject(err);
            const content = JSON.parse(data);
            content.dependencies["olum-helpers"] = "latest";
            fs.writeFile(`./${name}/package.json`, JSON.stringify(content, null, 2), err => {
              if (err) return reject(err);
              return resolve();
            });
          });
        }
        
        return resolve();
      });
    });
  }

  git(name) {
    this.loader("Initializing git repository");
    return new Promise((resolve, reject) => {
      exec(`cd ${name} && git init && git add . && git commit -m "Initial Commit via Olum CLI"`, (error, stdout, stderr) => {
        if (error) return reject(error);
        console.log(stdout);
        console.log(stderr);
        resolve();
      });
    });
  }

  dep(name) {
    this.loader("Installing packages");
    return new Promise((resolve, reject) => {
      exec(`cd ${name} && npm i`, (error, stdout, stderr) => {
        if (error) return reject(error);
        console.log(stdout);
        console.log(stderr);
        resolve();
      });
    });
  }

  postInstall(name) {
    const cd = colors.cyan("cd "+name);
    const dev = colors.cyan("npm run dev");
    const build = colors.cyan("npm run build\n");
    const border = "────────────────";
    const title = colors.green.bold("Happy Coding!");
    const info = 
    `
    ${colors.green.bold(border)}
    
      ${title}  

      - Navigate to project:    ${cd}
      - Run Development Server: ${dev}
      - Build for Production:   ${build}
    ${colors.green.bold(border)}
    `;
    this.stopLoader();
    console.clear();
    console.log(info);

    // check latest version of olum-cli
    exec('npm show olum-cli version', (error, stdout, stderr) => {
      if (error || stderr) return;
      const current = require("../package.json").version;
      const latest = stdout.trim();
      const currentVerArr = current.split(".");
      const latestVerArr = latest.split(".");
      
      if (isFullArr(currentVerArr) && isFullArr(latestVerArr) ) {
        let type;
        // current 
        const currentMajor = +currentVerArr[0];
        const currentMinor = +currentVerArr[1];
        const currentRevision = +currentVerArr[2];
        // latest
        const latestMajor = +latestVerArr[0];
        const latestMinor = +latestVerArr[1];
        const latestRevision = +latestVerArr[2];
        
        // console.log({currentMajor, currentMinor, currentRevision});
        // console.log({latestMajor, latestMinor, latestRevision});
        
        if (currentMajor < latestMajor) type = "major";
        else if (currentMinor < latestMinor) type = "minor";
        else if (currentRevision < latestRevision) type = "revision";
        
        const hint = 
        `
    ${colors.yellow.bold(border)}
    
      ${`New ${colors.red(type)} version of olum-cli available! ${colors.red(current)} > ${colors.green(latest)}`}
      
      ${`Run ${colors.green("npm install -g olum-cli")} to update!`}
      
    ${colors.yellow.bold(border)}
        `;
        
        if (typeof type != "undefined") console.log(hint);

      }
      
    });

  }

  loader(msg) {
    if (typeof this.interval != "undefined") {
      clearInterval(this.interval);
      console.log("\n");
    }
    const loader = ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"];
    let x = 0;
    this.interval = setInterval(() => {
      if (x < loader.length - 1) x++;
      else x = 0;
      process.stdout.write("\r" + colors.yellow.bold(msg) + " " + colors.yellow.bold(loader[x]) + "     ");
    }, 50);
  }
  
  stopLoader() {
    if (typeof this.interval != "undefined") clearInterval(this.interval);
  }
  
  gitignore(name) {
    return new Promise((resolve, reject) => {
      const content = 
`# Olum files/dirs
package-lock.json
build
desktop
nwjs

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test
.env.production

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test
.vscode

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# macOS
.DS_Store`;

      fs.writeFile(`./${name}/.gitignore`, content, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  
  readme(name) {
    return new Promise((resolve, reject) => {
      const content = 
`# ${name}

## Installation
\`\`\`
npm install
\`\`\`

### Development server
\`\`\`
npm run dev
\`\`\`

### Build for production
\`\`\`
npm run build
\`\`\`

See [Documentation](https://olumjs.github.io/docs)`;

      fs.writeFile(`./${name}/README.md`, content, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  
  detect() {
    return new Promise((resolve, reject) => {
      const q1 = {
        type: "checkbox",
        name: "pkg",
        message: "Select packages",
        choices: [
          { name: " olum-router", value: "router" },
          { name: " olum-helpers", value: "helpers" },
        ],
      };
      inquirer.prompt([q1]).then(res => {
        const answer = res.pkg;
        if (!answer.length) {
          resolve("core");
        } else {
          if (answer.length === 1 && answer.includes("router")) {
            resolve("router");
          } else if (answer.length === 1 && answer.includes("helpers")) {
            this.hasHelpers = true;
            resolve("core");
          } else if (answer.length > 1) {
            this.hasHelpers = true;
            resolve("router");
          }
        }
      }).catch(reject);
    });
  }
  
  async create(name) {
    try {
      // select modules
      const answer = await this.detect();
      
      // generate boilerplate
      await this.clone(name, answer);
      await this.readme(name);
      await this.gitignore(name);
      
      // installing modules
      // await this.dep(name);
      
      // init git repo
      await this.git(name);
      
      // instructions
      this.postInstall(name);
    } catch (err) {
      this.stopLoader();
      console.error(colors.red(err));
    }
  }
}

new CLI();