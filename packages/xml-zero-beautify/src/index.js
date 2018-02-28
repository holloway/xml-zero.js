// @flow
import Lexx, { NodeTypes } from "xml-zero-lexer";

/*
NodeTypes:
  XML_DECLARATION: 0, // unofficial
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3, // Note that these can include entities which should be resolved before display
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5, // Not used
  ENTITY_NODE: 6, // Only supported as <!ENTITY ...> outside of <!DOCTYPE ...>
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9, // Not used. Root elements are just elements.
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11, // Don't support this either
  NOTATION_NODE: 12,
  CLOSE_ELEMENT: 13, // unofficial
  JSX_ATTRIBUTE: 14, // unofficial
  JSX: 15 // unofficial
*/

type Options = {
  jsx: boolean,
  beautify: boolean,
  html: boolean
};

export const OUTPUT_FORMATS = {
  plaintext: "plaintext",
  html: "html"
};

const defaultOptions = {
  jsx: false,
  beautify: true, // false means it won't format with whitespace, it will just print,
  html: false, // whether to ensure tags like <script> aren't printed as <script/>.
  // HTML5 allows self-closing <img /> cite https://www.w3.org/TR/html5/syntax.html#start-tags
  // as summarised in this Stackoverflow:
  //   "The slash at the end of the start tag is allowed, but has no meaning.
  //    It is just syntactic sugar for people (and syntax highlighters) that are addicted to XML."
  //  -- https://stackoverflow.com/a/3558200
  output: OUTPUT_FORMATS.plaintext, // plaintext or html,
  outputHtmlClassPrefix: "b-"
};

type Token = Array<number>;

const closeTag = (
  xml: string,
  token: Token,
  inElement: boolean,
  useOptions: Options,
  format: Function
) => {
  if (inElement !== false) {
    let b = "";
    if (
      inElement !== NodeTypes.ELEMENT_NODE &&
      (inElement !== NodeTypes.DOCUMENT_TYPE_NODE &&
        inElement !== NodeTypes.ENTITY_NODE &&
        inElement !== NodeTypes.NOTATION_NODE)
    ) {
      b += "?";
    }
    b += ">";
    b = format(b, "tag-end", useOptions);
    if (useOptions.beautify) b += format.linebreak;
    return b;
  }
  return "";
};

const findIndexReverse = (
  originalIndex: number,
  tokens: Array<Token>,
  nodeType: number
) => {
  let i = originalIndex;
  while (i--) {
    if (tokens[i][0] === nodeType) return originalIndex - i;
  }
};

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

const HTML_NO_SHORTHAND = ["script", "a"];

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

const Beautify = (xml: string, options: Options) => {
  "use strict";
  const useOptions = {
    ...defaultOptions,
    ...options
  };

  const format =
    useOptions.output === OUTPUT_FORMATS.plaintext
      ? formatAsPlaintext
      : formatAsHTML;

  const tokens = Lexx(xml, { jsx: !!options.jsx, html: useOptions.html });

  const depth = [];
  let b = "";
  let inElement = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    switch (token[0]) {
      case NodeTypes.XML_DECLARATION: {
        b += format("<?xml", "data", useOptions);
        inElement = NodeTypes.XML_DECLARATION;
        break;
      }
      case NodeTypes.ELEMENT_NODE: {
        b += closeTag(xml, token, inElement, useOptions, format);
        inElement = false;
        if (useOptions.beautify && depth.length > 0) {
          b += format.indentation.repeat(
            tokens[i + 1] &&
            tokens[i + 1][0] === NodeTypes.CLOSE_ELEMENT &&
            token.length === 1
              ? depth.length - 1
              : depth.length
          );
        }
        depth.push(token.length > 1 ? xml.substring(token[1], token[2]) : "");
        const tagName = depth[depth.length - 1];
        b += format(`<`, "tag-start", useOptions);
        b += format(`${tagName ? tagName : ""}`, "tag", useOptions);
        inElement = NodeTypes.ELEMENT_NODE;
        break;
      }
      case NodeTypes.ATTRIBUTE_NODE: {
        b += " "; // attributes are preceded by a space
        const value = xml.substring(token[1], token[2]);
        b += format(
          value.match(/\s/) ||
          (inElement === NodeTypes.DOCUMENT_TYPE_NODE &&
            findIndexReverse(i, tokens, NodeTypes.DOCUMENT_TYPE_NODE) > 2) || // Document Types have particular attribute order and escaping
          (inElement === NodeTypes.ENTITY_NODE &&
            findIndexReverse(i, tokens, NodeTypes.ENTITY_NODE) > 2) || // Entity Types have particular attribute order and escaping
          (inElement === NodeTypes.NOTATION_NODE &&
            findIndexReverse(i, tokens, NodeTypes.NOTATION_NODE) > 2)
            ? `"${value}"`
            : value,
          "attr-key",
          useOptions
        );
        if (token.length > 3) {
          b += format("=", "attr-equals", useOptions);
          b += format(
            `"${xml.substring(token[3], token[4])}"`,
            "attr-value",
            useOptions
          );
        }
        break;
      }
      case NodeTypes.TEXT_NODE: {
        b += closeTag(xml, token, inElement, useOptions, format);
        inElement = false;
        let text = xml.substring(token[1], token[2]);
        if (text.trim().length === 0) break; // exit early if it's an empty text node

        if (useOptions.beautify) {
          b +=
            format.indentation.repeat(depth.length) +
            format(text.trim().replace(/[\n\r]/g, " "), "text", useOptions) +
            format.linebreak;
        } else {
          b += format(text, "text", useOptions);
        }
        break;
      }
      case NodeTypes.CDATA_SECTION_NODE: {
        b +=
          format(
            `<![CDATA[${xml.substring(token[1], token[2])}]]>`,
            "data",
            useOptions
          ) + format.linebreak;
        break;
      }
      case NodeTypes.ENTITY_NODE: {
        inElement = NodeTypes.ENTITY_NODE;
        b += format("<!ENTITY", "data", useOptions);
        break;
      }
      case NodeTypes.PROCESSING_INSTRUCTION_NODE: {
        inElement = NodeTypes.PROCESSING_INSTRUCTION_NODE;
        b += format(
          `<?${xml.substring(token[1], token[2])}`,
          "data",
          useOptions
        );
        break;
      }
      case NodeTypes.COMMENT_NODE: {
        if (useOptions.beautify) b += format.indentation.repeat(depth.length);
        b +=
          format(
            `<!--${xml.substring(token[1], token[2])}-->`,
            "data",
            useOptions
          ) + format.linebreak;
        break;
      }
      case NodeTypes.DOCUMENT_TYPE_NODE: {
        inElement = NodeTypes.DOCUMENT_TYPE_NODE;
        b += format("<!DOCTYPE", "doctype", useOptions);
        break;
      }
      case NodeTypes.NOTATION_NODE: {
        inElement = NodeTypes.NOTATION_NODE;
        b += format("<!NOTATION", "data", useOptions);
        break;
      }
      case NodeTypes.CLOSE_ELEMENT: {
        const tagName = depth.pop();
        if (
          useOptions.html &&
          HTML_NO_SHORTHAND.indexOf(tagName.toLowerCase()) !== -1
        ) {
          if (inElement) {
            b += format(">", "tag-end", useOptions) + format.linebreak;
          }
          inElement = false;
        }
        if (inElement === false) {
          if (useOptions.beautify) {
            b += format.indentation.repeat(depth.length);
          }
          b += format("<", "tag-start", useOptions);
        }
        if (inElement === NodeTypes.XML_DECLARATION) {
          b += format("?", "data", useOptions);
        } else {
          b += format("/", "tag-end", useOptions);
        }

        b += format(
          inElement === false && tagName ? tagName : "",
          "tag",
          useOptions
        );
        b += format(">", "tag-end", useOptions);
        if (useOptions.beautify) b += format.linebreak;
        inElement = false;
        break;
      }
      case NodeTypes.JSX_ATTRIBUTE: {
        b += " ";
        b += format(
          `${xml.substring(token[1], token[2])}`,
          "attr-key",
          useOptions
        );
        b += format("=", "attr-equals", useOptions);
        b += format(
          `{${xml.substring(token[3], token[4])}}`,
          "attr-values",
          useOptions
        );
        break;
      }
      case NodeTypes.JSX: {
        if (useOptions.beautify) {
          b += format.indentation.repeat(depth.length);
        }
        b +=
          format(`{${xml.substring(token[1], token[2])}}`, "data", useOptions) +
          format.linebreak;
        break;
      }
    }
  }
  if (inElement !== false) {
    b += closeTag(xml, undefined, inElement, useOptions, format);
  }
  return b;
};

export default Beautify;
