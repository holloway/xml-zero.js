// @flow
import Lexx, { NodeTypes } from "css-zero-lexer";

type Options = {
  beautify: boolean,
  output: "plaintext" | "html"
};

export const OUTPUT_FORMATS = {
  plaintext: "plaintext",
  html: "html"
};

const defaultOptions = {
  beautify: true, // false means it won't format with whitespace, it will just print,
  output: OUTPUT_FORMATS.plaintext, // plaintext or html,
  outputHtmlClassPrefix: "b-"
};

type Token = Array<number>;

const ESCAPE_MAPPING = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  '"': "&quot;",
  "'": "&apos;"
};

export const escape = (text: string) =>
  text.replace(
    /([<>&'"])/g,
    (match: string, char: string) => ESCAPE_MAPPING[char]
  );

const formatAsHTML = (text: string, type: string, options: Options) =>
  text
    ? `<span class="${options.outputHtmlClassPrefix}${type}">${escape(
        text
      )}</span>`
    : text;
formatAsHTML.indentation = " &nbsp;";
formatAsHTML.linebreak = "<br/>\n";

const formatAsPlaintext = (text: string) => text;
formatAsPlaintext.indentation = "  ";
formatAsPlaintext.linebreak = "\n";

const Beautify = (css: string, options: Options) => {
  "use strict";
  const useOptions = {
    ...defaultOptions,
    ...options
  };

  const format =
    useOptions.output === OUTPUT_FORMATS.plaintext
      ? formatAsPlaintext
      : formatAsHTML;

  const tokens = Lexx(css);

  const depth = [];
  let b = "";
  let inElement = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
  }
  return b;
};

export default Beautify;
