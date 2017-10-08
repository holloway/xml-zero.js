// @flow
import FlowSrcSync, { beautify } from "./index";

const [node, thisScript, ...args] = process.argv;

const [code, errors] = FlowSrcSync(...args);

if (errors) {
  process.stderr.write(beautify(errors));
}

process.exit(code);
