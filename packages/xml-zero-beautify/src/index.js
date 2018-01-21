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
  beautify: boolean
};

const defaultOptions = {
  jsx: false,
  beautify: true // false means it won't format with whitespace, it will just print
};

type Token = Array<number>;

const closeTag = (
  xml: string,
  token: Token,
  inElement: boolean,
  useOptions: Options
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
    if (useOptions.beautify) b += "\n";
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

const Beautify = (xml: string, options: Options) => {
  "use strict";
  const useOptions = {
    ...defaultOptions,
    ...options
  };

  const tokens = Lexx(xml, { jsx: !!options.jsx });

  const depth = [];
  let b = "";
  let inElement = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    switch (token[0]) {
      case NodeTypes.XML_DECLARATION: {
        b += "<?xml";
        inElement = NodeTypes.XML_DECLARATION;
        break;
      }
      case NodeTypes.ELEMENT_NODE: {
        b += closeTag(xml, token, inElement, useOptions);
        inElement = false;
        if (useOptions.beautify && depth.length > 0) {
          b += "  ".repeat(
            tokens[i + 1] &&
            tokens[i + 1][0] === NodeTypes.CLOSE_ELEMENT &&
            token.length === 1
              ? depth.length - 1
              : depth.length
          );
        }
        depth.push(token.length > 1 ? xml.substring(token[1], token[2]) : "");
        const tagName = depth[depth.length - 1];
        b += `<${tagName ? tagName : ""}`;
        inElement = NodeTypes.ELEMENT_NODE;
        break;
      }
      case NodeTypes.ATTRIBUTE_NODE: {
        b += " "; // attributes are preceded by a space
        const value = xml.substring(token[1], token[2]);
        b +=
          value.match(/\s/) ||
          (inElement === NodeTypes.DOCUMENT_TYPE_NODE &&
            findIndexReverse(i, tokens, NodeTypes.DOCUMENT_TYPE_NODE) > 2) || // Document Types have particular attribute order and escaping
          (inElement === NodeTypes.ENTITY_NODE &&
            findIndexReverse(i, tokens, NodeTypes.ENTITY_NODE) > 2) || // Entity Types have particular attribute order and escaping
          (inElement === NodeTypes.NOTATION_NODE &&
            findIndexReverse(i, tokens, NodeTypes.NOTATION_NODE) > 2)
            ? `"${value}"`
            : value;
        if (token.length > 3) {
          b += `="${xml.substring(token[3], token[4])}"`;
        }
        break;
      }
      case NodeTypes.TEXT_NODE: {
        b += closeTag(xml, token, inElement, useOptions);
        inElement = false;
        let text = xml.substring(token[1], token[2]);
        if (text.trim().length === 0) break; // exit early if it's an empty text node

        if (useOptions.beautify) {
          b +=
            "  ".repeat(depth.length) +
            text.trim().replace(/[\n\r]/g, " ") +
            "\n";
        } else {
          b += text;
        }
        break;
      }
      case NodeTypes.CDATA_SECTION_NODE: {
        b += `<![CDATA[${xml.substring(token[1], token[2])}]]>\n`;
        break;
      }
      case NodeTypes.ENTITY_NODE: {
        inElement = NodeTypes.ENTITY_NODE;
        b += "<!ENTITY";
        break;
      }
      case NodeTypes.PROCESSING_INSTRUCTION_NODE: {
        inElement = NodeTypes.PROCESSING_INSTRUCTION_NODE;
        b += `<?${xml.substring(token[1], token[2])}`;
        break;
      }
      case NodeTypes.COMMENT_NODE: {
        if (useOptions.beautify) b += "  ".repeat(depth.length);
        b += `<!--${xml.substring(token[1], token[2])}-->\n`;
        break;
      }
      case NodeTypes.DOCUMENT_TYPE_NODE: {
        inElement = NodeTypes.DOCUMENT_TYPE_NODE;
        b += "<!DOCTYPE";
        break;
      }
      case NodeTypes.NOTATION_NODE: {
        inElement = NodeTypes.NOTATION_NODE;
        b += "<!NOTATION";
        break;
      }
      case NodeTypes.CLOSE_ELEMENT: {
        const tagName = depth.pop();
        if (inElement === false) {
          if (useOptions.beautify) {
            b += "  ".repeat(depth.length);
          }
          b += "<";
        }
        if (inElement === NodeTypes.XML_DECLARATION) {
          b += "?";
        } else {
          b += "/";
        }

        b += inElement === false && tagName ? tagName : "";
        b += ">";
        if (useOptions.beautify) b += "\n";
        inElement = false;
        break;
      }
      case NodeTypes.JSX_ATTRIBUTE: {
        b += " ";
        b += `${xml.substring(token[1], token[2])}={${xml.substring(
          token[3],
          token[4]
        )}}`;
        break;
      }
      case NodeTypes.JSX: {
        if (useOptions.beautify) {
          b += "  ".repeat(depth.length);
        }
        b += `{${xml.substring(token[1], token[2])}}\n`;
        break;
      }
    }
  }
  if (inElement !== false) {
    if (xml.indexOf("zaz") !== -1) {
      console.log("inElmeent", inElement, b, tokens);
    }
    b += closeTag(xml, undefined, inElement, useOptions);
  }
  return b;
};

export default Beautify;
