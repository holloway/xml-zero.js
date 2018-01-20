// @flow
import Lexx, { NodeTypes } from "xml-zero-lexer";

type Options = {
  jsx: boolean,
  beautify: boolean
};

const defaultOptions = {
  jsx: false,
  beautify: true // false means it won't format with whitespace, it will just print
};

const NodeTypes2 = {
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
};

type Token = Array<number>;

const closeTag = (
  xml: string,
  token: Token,
  inElement: boolean,
  useOptions: Options
) => {
  if (inElement !== false) {
    let b = `${inElement !== NodeTypes.ELEMENT_NODE ? "?" : ""}>`;
    if (useOptions.beautify) b += "\n";
    return b;
  }
  return "";
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
        if (
          useOptions.beautify &&
          tokens[i + 1] &&
          tokens[i + 1][0] !== NodeTypes.CLOSE_ELEMENT
        ) {
          b += "  ".repeat(depth.length);
        }
        depth.push(token.length > 1 ? xml.substring(token[1], token[2]) : "");
        const tagName = depth[depth.length - 1];
        b += `<${tagName ? tagName : ""}`;
        inElement = NodeTypes.ELEMENT_NODE;
        break;
      }
      case NodeTypes.ATTRIBUTE_NODE: {
        if (
          tokens[i - 1].length === 1 &&
          tokens[i - 1][0] === NodeTypes.ELEMENT_NODE
        ) {
        }
        b += " "; // element without name
        b += useOptions.beautify
          ? xml.substring(token[1], token[2]).trim()
          : xml.substring(token[1], token[2]);
        if (token.length > 3) {
          b += `="${xml.substring(token[3], token[4])}"`;
        }
        break;
      }
      case NodeTypes.TEXT_NODE: {
        // self-closing element
        b += closeTag(xml, token, inElement, useOptions);
        inElement = false;
        if (useOptions.beautify) b += "  ".repeat(depth.length);
        b += useOptions.beautify
          ? xml.substring(token[1], token[2]).trim()
          : xml.substring(token[1], token[2]);
        if (useOptions.beautify) b += "\n";
        break;
      }
      case NodeTypes.CDATA_SECTION_NODE: {
        b += ``;
        break;
      }
      case NodeTypes.ENTITY_NODE: {
        b += ``;
        break;
      }
      case NodeTypes.PROCESSING_INSTRUCTION_NODE: {
        inElement = NodeTypes.PROCESSING_INSTRUCTION_NODE;
        b += `<?${xml.substring(token[1], token[2])}`;
        break;
      }
      case NodeTypes.COMMENT_NODE: {
        b += ``;
        break;
      }
      case NodeTypes.DOCUMENT_TYPE_NODE: {
        b += ``;
        break;
      }
      case NodeTypes.NOTATION_NODE: {
        b += ``;
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
        console.log(inElement);
        b += `/${inElement === false && tagName ? tagName : ""}>`;
        if (useOptions.beautify) b += "\n";
        inElement = false;
        break;
      }
      case NodeTypes.JSX_ATTRIBUTE: {
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
    console.log("inElement1", inElement, b);
    b += closeTag(xml, undefined, inElement, useOptions);
    console.log("inElement2", inElement, b);
  }

  console.log(tokens, b);
  return b;
};

export default Beautify;
