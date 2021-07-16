#!/usr/bin/env node
/**
 * @name Olum-cli.js
 * @version 0.0.5
 * @copyright 2021
 * @author Eissa Saber
 * @license MIT
 */
const commander = require("commander");
const cmd = new commander.Command();
const extra = require("fs-extra");
const path = require("path");
const colors = require("colors");
const shell = require("shelljs");

class CLI {
  constructor() {
    cmd.command("create").arguments("<name>").action(this.create.bind(this));
    cmd.parse(process.argv);
  }

  async create(name) {
    try {
      await this.clone(name);
      await this.git(name);
      await this.dep(name);
      console.log(colors.blue.bold("Build in dev mode: npm run dev\n" + "Build for deployment: npm run build" ));
      console.log(colors.cyan("cd " + name));
    } catch (err) {
      console.error(colors.red(err));
    }
  }

  clone(name) {
    const template = path.resolve(__dirname, "../template");
    return new Promise((resolve, reject) => {
      extra.copy(template, `./${name}`, err => {
        if (err) reject("Error while cloning Olum template \n" + err);
        console.log(colors.green.bold(`Cloned "${template}" to current directory.`));
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