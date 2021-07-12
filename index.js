#!/usr/bin/env node
const commander = require("commander");
const cmd = new commander.Command();
const fs = require("fs");
const extra = require("fs-extra");
const path = require("path");
const colors = require("colors");
const shell = require("shelljs");

// ./olum.js create my-app
class CLI {
  template = path.resolve(__dirname, "./template");
  
  constructor() {
    cmd
      .command("create")
      .arguments("<name>")
      .description("Create Olumjs app")
      // .option('-d, --debug', 'debug mode')
      .action(this.create.bind(this));

    cmd.parse(process.argv);
  }

  async create(name) {
    // if (cmd.opts().debug) console.log("debug options");

    try {
      await this.clone(name);
      await this.git(name);
      await this.dep(name);
      console.log(colors.blue.white("Build: npm run build\n"+"DevServer: npm run dev"));
      console.log(colors.cyan("cd " + name));
    } catch (err) {
      console.error(colors.red(err));
    }

  }

  clone(name) {
    return new Promise((resolve, reject) => {
      extra.copy(this.template, `./${name}`, err => {
        if (err) reject("Error while cloning Olum template \n" + err);
        console.log(colors.green.bold(`Cloned "${this.template}" to current directory.`));
        resolve();
      });
    });
  }

  git(name) {
    return new Promise((resolve, reject) => {
      if (shell.exec(`cd ${name} && git init`).code !== 0) {
        reject("Error while creating git repo!");
      } else {
        console.log(colors.green.bold("Created Git Repo."));
        resolve();
      }
    });
  }

  dep(name) {
    return new Promise((resolve, reject) => {
      if (shell.exec(`cd ${name} && npm i`).code !== 0) {
        reject("Error while installing dependencies!");
      } else {
        console.log(colors.green.bold("Installed dependencies."));
        resolve();
      }
    });
  }
}

new CLI();
