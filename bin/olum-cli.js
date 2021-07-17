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
const signature = `
  MMP"""""YMM dP                        MM'""""'YMM M""MMMMMMMM M""M
  M' .mmm. 'M 88                        M' .mmm. 'M M  MMMMMMMM M  M
  M  MMMMM  M 88 dP    dP 88d8b.d8b.    M  MMMMMooM M  MMMMMMMM M  M
  M  MMMMM  M 88 88    88 88''88''88    M  MMMMMMMM M  MMMMMMMM M  M
  M. 'MMM' .M 88 88.  .88 88  88  88    M. 'MMM' .M M  MMMMMMMM M  M
  MMb     dMM dP '88888P' dP  dP  dP    MM.     .dM M         M M  M
  MMMMMMMMMMM                           MMMMMMMMMMM MMMMMMMMMMM MMMM
`;

class CLI {
  constructor() {
    cmd.version("0.0.5").description(colors.magenta.bold(signature));
    cmd.on('command:*', operands => {
      console.error(colors.red(`error: unknown command '${operands[0]}'\n Try running olum --help`));
      process.exitCode = 1;
    });
    cmd.on("--help", this.guide.bind(this));
    cmd.command("create").arguments("<name>").action(this.create.bind(this));
    cmd.parse(process.argv);
  }

  guide() {
    const commands = `
    ${colors.yellow("Available Commands:")}
      ${colors.cyan("olum create my-app")} Creates boilerplate in your current directory.
      ${colors.cyan("olum --version")} Outputs Olum CLI version.
      ${colors.cyan("olum --help")} Lists available commands.
      ${colors.cyan("npm i -g olum-cli")} Installs/updates Olum CLI tool on your machine.
      ${colors.cyan("npm run dev")} Creates dev server, must be run from the root of olum app.
      ${colors.cyan("npm run build")} Compiles/bundles your Olum app for deployment, must be run from the root of olum app.
      ${colors.yellow("\nSee Documentation")} ${colors.cyan("https://github.com/olumjs/olum/wiki")}
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
      console.log(colors.magenta.bold(signature));
      console.log(colors.green.bold(`Generating Boilerplate...`));
      await this.clone(name);
      console.log(colors.green.bold("Initializing Git Repository..."));
      await this.git(name);
      console.log(colors.green.bold("Installing Packages..."));
      await this.dep(name);
      this.postInstall(name);
    } catch (err) {
      console.error(colors.red(err));
    }
  }

}

new CLI();