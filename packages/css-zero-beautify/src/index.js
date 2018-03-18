// @flow
import Lexx, { NodeTypes } from "css-zero-lexer";

export { Lexx as CSSZeroLexer, NodeTypes as CSSZeroLexerNodeTypes };

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

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    switch (token[0]) {
      case NodeTypes.PROPERTY_NODE:
        if (useOptions.beautify && depth.length > 0) {
          b += format.indentation.repeat(depth.length);
        }
        b += format(
          css.substring(token[1], token[2]).trim(),
          "prop",
          useOptions
        );
        break;
      case NodeTypes.CLOSE_PROPERTY:
        b += format(";", "prop-close", useOptions);
        if (useOptions.beautify) {
          b += format.linebreak;
        }
        break;
      case NodeTypes.SELECTOR_NODE:
        if (useOptions.beautify && depth.length > 0) {
          b += format.indentation.repeat(depth.length);
        }
        b += format(
          css.substring(token[1], token[2]).trim(),
          "selector",
          useOptions
        );
        break;
      case NodeTypes.SELECTOR_SEPARATOR: // comma character between selectors
        b += format(",", "comma", useOptions);
        if (useOptions.beautify) {
          b += format.linebreak;
        }
        break;
      case NodeTypes.OPEN_RULE:
        if (useOptions.beautify) {
          b += " ";
        }
        b += format("{", "open-rule", useOptions);
        if (useOptions.beautify) {
          b += format.linebreak;
        }
        depth.push(NodeTypes.OPEN_RULE);
        break;
      case NodeTypes.CLOSE_RULE:
        if (tokens[i - 1][0] === NodeTypes.COMMENT_NODE) {
          b += format.linebreak;
        }
        if (useOptions.beautify && depth.length > 0) {
          b += format.indentation.repeat(depth.length - 1);
        }
        b += format("}", "close-rule", useOptions);
        if (useOptions.beautify) {
          b += format.linebreak;
        }
        depth.pop();
        break;
      case NodeTypes.COMMENT_NODE:
        if (useOptions.beautify && depth.length > 0) {
          b += format.indentation.repeat(depth.length);
        }
        b += format(
          `/*${css.substring(token[1], token[2])}*/`,
          "comment",
          useOptions
        );
        break;
    }
  }
  return b;
};

export default Beautify;
