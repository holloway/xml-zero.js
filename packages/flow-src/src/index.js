// @flow
import path from "path";
import Chalk from "chalk";
import { execSync } from "child_process";

const nodeModulesPattern = /\/node_modules\//; // we'll assume that node_modules anywhere in the path is excluded

const bufferToString = data =>
  data instanceof Buffer ? data.toString("utf8") : data;

export const filter = (errors: Array<Object>): Array<Object> =>
  errors.filter(error =>
    error.message.every(msg => !msg.path.match(nodeModulesPattern))
  );

export const beautify = (result: Object): string => {
  return result.errors && result.errors.length > 0
    ? `Errors:\r\n${result.errors.map(eachError)}`
    : Chalk.green("\nNo Errors\n");
};

const eachError = (error: Object): string => {
  return error.message.reduce((template, msg) => {
    return (template += `\n\n${Chalk.red(msg.descr)} ${Chalk.white(
      msg.context
    )}\n ${Chalk.underline.gray(msg.path)}\n`);
  }, "");
};

const options = {
  stdio: "ignore"
};

const FlowSrcSync = (...args: string[]): [number, Object] => {
  let result = {},
    code,
    buffer;

  try {
    buffer = execSync(`flow --json ${args ? args.join(" ") : ""}`, options);
    code = 0;
  } catch (e) {
    code = e.status;
    buffer = e.stderr || e.stdout;
  }

  if (buffer) {
    result = JSON.parse(bufferToString(buffer));
    // console.log("result was", result);
    result.errors = filter(result.errors);
  }

  return [code, result];
};

export default FlowSrcSync;
