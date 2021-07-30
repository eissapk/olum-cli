#!/usr/bin/env node
/**
 * @name olum-cli
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
const pkgJSON = require("../package.json");

// helpers
const isObj = obj => !!(obj !== null && typeof obj === "object");
const isFullArr = arr => !!(isObj(arr) && Array.isArray(arr) && arr.length);
const isDef = val => !!(val !== undefined && val !== null);

class CLI {

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
    const shorthand = pkgJSON.olum_guide;
    // title colors
    const titleArr = shorthand.colors.title;
    const randomColor = titleArr[this.random(titleArr)];
    // signature shapes
    const signatureArr = shorthand.signature;
    const randomSignature = signatureArr[this.random(signatureArr)];

    const commands = `
    ${colors[randomColor](randomSignature)}
    ${pkgJSON.description}

    ${colors[randomColor](shorthand.commands.title)}
      ${colors[shorthand.colors.command](shorthand.commands.help.cmd)} ${shorthand.commands.help.desc}
      ${colors[shorthand.colors.command](shorthand.commands.version.cmd)} ${shorthand.commands.version.desc}
      ${colors[shorthand.colors.command](shorthand.commands.create.cmd)} ${shorthand.commands.create.desc}
      ${colors[shorthand.colors.command](shorthand.commands.update.cmd)} ${shorthand.commands.update.desc}
      ${colors[shorthand.colors.command](shorthand.commands.dev.cmd)} ${shorthand.commands.dev.desc}
      ${colors[shorthand.colors.command](shorthand.commands.build.cmd)} ${shorthand.commands.build.desc}

    ${colors[randomColor](shorthand.docs.title)} ${colors.cyan(shorthand.docs.url)}
    `;

    console.log(commands);
  }

  clone(name) {
    const boilerplate = path.resolve(__dirname, "../boilerplate");
    return new Promise((resolve, reject) => {
      extra.copy(boilerplate, `./${name}`, err => {
        if (err) reject("Error while creating Olum boilerplate \n" + err);
        resolve();
      });
    });
  }

  git(name) {
    return new Promise((resolve, reject) => {
      if (shell.exec(`cd ${name} && git init`).code !== 0) {
        reject("Error while creating git repo!");
      } else {
        resolve();
      }
    });
  }

  dep(name) {
    return new Promise((resolve, reject) => {
      if (shell.exec(`cd ${name} && npm i`).code !== 0) {
        reject("Error while installing dependencies!");
      } else {
        resolve();
      }
    });
  }

  postInstall(name) {
    console.log(colors.yellow.bold("\nHappy Hacking 😎"));
    console.log("Navigate to project 👉 " + colors.cyan("cd " + name));
    console.log("Development mode 👉 " + colors.cyan("npm run dev"));
    console.log("Production mode 👉 " + colors.cyan("npm run build\n"));
  }

  async create(name) {
    try {
      console.log(colors.green.bold(`Generating boilerplate...`));
      await this.clone(name);
      console.log(colors.green.bold("Initializing git repository..."));
      await this.git(name);
      console.log(colors.green.bold("Installing packages..."));
      await this.dep(name);
      this.postInstall(name);
    } catch (err) {
      console.error(colors.red(err));
    }
  }
}

new CLI();