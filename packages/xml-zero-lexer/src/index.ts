export const NodeTypes = {
  XML_DECLARATION: 0, // unofficial
  // Most XML parsers ignore this but because I'm parsing it I may as well include it.
  // At least it lets you know if there were multiple declarations.
  //
  // Also inserting it here makes Object.keys(NodeTypes) array indexes line up with values!
  // E.g. Object.keys(NodeTypes)[0] === NodeTypes.XML_DECLARATION
  // (Strictly speaking map keys are unordered but in practice they are, and we don't rely on it)
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3, // Note that these can include entities which should be resolved before display
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5, // Not used
  //
  // After a lot of thought I've decided that entities shouldn't be resolved in the Lexer,
  //
  // Instead entities are just ignored and are stored as-is as part of the node because:
  // (1) We only support entities that resolve to characters, we don't support crufty
  //     complicated entities that insert elements, so there's no actual structural need to
  //     do it.
  // (2) It simplifies the code and data structures, and it shrinks data structure memory usage.
  //     E.g. Text doesn't need to switch between TEXT_NODE and ENTITY_REFERENCE_NODE.
  // (3) They can be resolved later using a utility function. E.g. have a .textContent() on
  //     nodes that resolves it. This approach would probably result in less memory use.
  // (4) It's slightly against style of zero-copy because we'd need to make new strings
  //     to resolve the entities. Not a difficult job but again it's unnecessary memory use.
  //
  //  So I've decided that's not the job of this lexer.
  //
  ENTITY_NODE: 6, // Only supported as <!ENTITY ...> outside of <!DOCTYPE ...>
  // E.g. <!DOCTYPE [ <!ENTITY> ]> will just be a string inside DOCTYPE and not an ENTITY_NODE.
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9, // Not used. Root elements are just elements.
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11, // Don't support this either
  NOTATION_NODE: 12,
  CLOSE_ELEMENT: 13, // unofficial
  JSX_ATTRIBUTE: 14, // unofficial
  JSX: 15, // unofficial
} as const;

type NODE_TYPES = typeof NodeTypes;

export type NODE_TYPE = typeof NodeTypes[keyof typeof NodeTypes];

export type NODE_NAME = keyof typeof NodeTypes;

export const NodeTypeKeys = Object.keys(NodeTypes).sort(
  (a, b) => NodeTypes[a as NODE_NAME] - NodeTypes[b as NODE_NAME]
);

const WHITESPACE = [" ", "\r", "\n", "\t"];

const QUOTES = ['"', "'"];

const ALL_QUOTES = ["`", ...QUOTES];

const JS_OPEN_NESTING = ["{", "("];
const JS_END_NESTING = ["}", ")"];
const JS_ESCAPE_STRING = "\\";
const JS_COMMENT = "//";
const JS_MULTILINE_COMMENT = ["/*", "*/"];
const LINE_BREAKS = ["\n", "\r"];
const JS_TEMPLATE_STRING = "`";
const JS_TEMPLATE_STRING_EXPRESSION = ["${", "}"];
const JSX_INLINE = ["{", "}"];

const seekNotChar = (
  xml: string,
  i: number,
  searchChars: Array<string>
): number => {
  while (searchChars.indexOf(xml[i]) !== -1) {
    i++;
    if (i > xml.length) throw Error("Error lexing XML. Unterminated node.");
  }
  return i;
};

const seekChar = (xml: string, i: number, searchChars: string[]): number => {
  while (searchChars.indexOf(xml[i]) === -1) {
    i++;
    if (i > xml.length) return i;
  }
  return i;
};

const seekString = (xml: string, i: number, searchString: string): number => {
  i = xml.indexOf(searchString, i);
  if (i === -1) i = xml.length;
  return i;
};

const seekJSExpression = (xml: string, i: number): number => {
  let nesting = 1;
  const JS_TOKENS = [
    ...JS_OPEN_NESTING,
    ...JS_END_NESTING,
    ...ALL_QUOTES,
    JS_COMMENT[0],
    JS_MULTILINE_COMMENT[0][0],
  ];

  let exitAfter = 1000000; // At least 10MB of tokens
  while (nesting > 0 && i < xml.length) {
    i++;

    i = seekChar(xml, i, JS_TOKENS);
    const char = xml[i];

    if (ALL_QUOTES.indexOf(char) !== -1) {
      i++;
      while (xml[i] !== char) {
        if (char === JS_TEMPLATE_STRING) {
          i = Math.min(
            seekChar(xml, i, [char, JS_ESCAPE_STRING]),
            seekString(xml, i, JS_TEMPLATE_STRING_EXPRESSION[0])
          );
          if (
            xml.substring(i, i + JS_TEMPLATE_STRING_EXPRESSION[0].length) ===
            JS_TEMPLATE_STRING_EXPRESSION[0]
          ) {
            i++;
            i = seekJSExpression(xml, i);
          }
        } else {
          i = seekChar(xml, i, [char, JS_ESCAPE_STRING, ...LINE_BREAKS]);
        }
        if (xml[i] === JS_ESCAPE_STRING) {
          i += 2; // can escapes ever be longer?
        } else if (
          char !== JS_TEMPLATE_STRING &&
          LINE_BREAKS.indexOf(xml[i]) !== -1
        ) {
          i++;
          break; // just exit
        }
        exitAfter--;
        if (exitAfter === 0) throw Error("Exiting after too many loops");
      }
    } else if (xml.substring(i, i + JS_COMMENT.length) === JS_COMMENT) {
      i = seekChar(xml, i, LINE_BREAKS);
      i++;
    } else if (
      xml.substring(i, i + JS_MULTILINE_COMMENT[0].length) ===
      JS_MULTILINE_COMMENT[0]
    ) {
      i = seekString(xml, i, JS_MULTILINE_COMMENT[1]);
      i++;
    } else if (JS_END_NESTING.indexOf(char) !== -1) {
      nesting--;
    } else if (JS_OPEN_NESTING.indexOf(char) !== -1) {
      nesting++;
    }
    exitAfter--;
    if (exitAfter === 0) throw Error("Exiting after too many loops");
  }
  return i;
};

export const onQuestionElement = (
  xml: string,
  i: number
): ParseReturnWithToken => {
  i++;
  const token: InternalToken = [NodeTypes.PROCESSING_INSTRUCTION_NODE, i];
  i = seekChar(xml, i, [">", "?", ...WHITESPACE]);
  if (xml[i] === ">" && xml[i - 1] === "/") {
    i--;
  }
  token.push(i);
  const tokenOne = token[1];
  if (tokenOne === undefined) throw Error(`Internal error`);

  if (xml.substring(tokenOne, token[2]) === "xml") {
    // it's actually an XML declaration
    token[0] = NodeTypes.XML_DECLARATION;
  }
  i = seekNotChar(xml, i, ["?", ">", ...WHITESPACE]);
  if (xml[i] === "?") i++;

  return [i, WHITESPACE.indexOf(xml[i]) === -1, token as TokenWithStart];
};

export const onAttribute = (
  xml: string,
  i: number,
  inElement: boolean
): ParseReturnWithToken => {
  const token: InternalToken = [NodeTypes.ATTRIBUTE_NODE];
  if (QUOTES.indexOf(xml[i]) !== -1) {
    // attribute with quoted name
    i++;
    token.push(i);
    i = seekChar(xml, i, [xml[i - 1]]);
    token.push(i); // end of attribute name
    i++; // skip quote
  } else if (xml[i] === "[" && WHITESPACE.indexOf(xml[i + 1]) !== -1) {
    token.push(i);
    i = seekString(xml, i, "]>");
    i += 1;
    token.push(i); // end of attribute name
  } else if (xml[i] === "{") {
    token.pop(); // delete default NODE_TYPE because this is JSX
    token.push(NodeTypes.JSX_ATTRIBUTE);
    i++;
    token.push(i);
    i--;
    i = seekJSExpression(xml, i);
    token.push(i);
    i++;
  } else {
    token.push(i);
    i = seekChar(xml, i, ["=", "/", ">", ...WHITESPACE]);
    token.push(i); // end of attribute name
  }

  // valueless attribute at the end of element so exit early
  if (xml[i] === ">") {
    if (xml[i - 1] === "?") {
      const tokenTwo = token[2];
      if (tokenTwo === undefined) throw Error(`Internal error`);
      token[2] = tokenTwo - 1;
    }
    i++;
    return [i, false, token as TokenWithStart];
  } else if (xml[i] === "/" && xml[i + 1] === ">") {
    return [i, true, token as TokenWithStart];
  }

  const notWhitespace = seekNotChar(xml, i, WHITESPACE);
  if (xml[notWhitespace] !== "=") {
    return [i, inElement, token as TokenWithStart];
  }
  i = notWhitespace + 1;
  const enclosed = seekNotChar(xml, i, WHITESPACE);
  const hasQuotes = QUOTES.indexOf(xml[i]) !== -1;
  // console.log("enclosed?", enclosed);
  if (hasQuotes) {
    // surrounded by quotes
    i++;
    token.push(i);
    i = seekChar(xml, i, [xml[enclosed]]);
    token.push(i);
    i++;
  } else if (xml[i] === "{") {
    // JSX attribute
    token[0] = NodeTypes.JSX_ATTRIBUTE;
    i++;
    token.push(i);
    i--;
    i = seekJSExpression(xml, i);
    token.push(i);
    i++;
  } else {
    // not surrounded by quotes
    token.push(i);
    i = seekChar(xml, i, [">", ...WHITESPACE]);
    if (xml[i] === ">" && xml[i - 1] === "?") {
      i--;
    }
    token.push(i);
  }

  i = seekNotChar(xml, i, WHITESPACE);
  return [i, true, token as TokenAttribute];
};

export const onEndTag = (xml: string, i: number): ParseReturnWithoutToken => {
  if (xml[i] === "?") {
    i++;
  }
  i++;
  return [i, false];
};

export const onClose = (
  xml: string,
  i: number,
  inElement: boolean
): ParseReturnWithToken => {
  // console.log("onClose, starting... ", xml[i], "from", xml);
  const token: InternalToken = [NodeTypes.CLOSE_ELEMENT];
  i = seekChar(xml, i, [">"]);
  i++;
  return [i, false, token as TokenWithStart];
};

export const onElement = (
  xml: string,
  i: number,
  inElement: boolean
): ParseReturnWithToken => {
  const token: InternalToken = [NodeTypes.ELEMENT_NODE, i];
  i = seekChar(xml, i, [">", "/", ...WHITESPACE]);

  if (token[1] === i) {
    // element was nameless "<>" or "<    attr>" or "< />"
    // element without a name
    token.pop();
    return [i, true, token as TokenWithStart];
  }

  token.push(i);
  return [i, true, token as TokenWithStart];
};

export const onExclamation = (
  xml: string,
  i: number,
  inElement: boolean
): ParseReturnWithToken => {
  const token: InternalToken = [];
  if (xml.substring(i, i + 3) === "!--") {
    // maybe this should be the default assumption?
    token.push(NodeTypes.COMMENT_NODE, i + 3);
    i = seekString(xml, i, "-->");
    token.push(i);
    i += 3;
    inElement = false;
  } else if (xml.substring(i, i + 8) === "!DOCTYPE") {
    i += 8;
    token.push(NodeTypes.DOCUMENT_TYPE_NODE);
  } else if (xml.substring(i, i + 8) === "![CDATA[") {
    i += 8;
    token.push(NodeTypes.CDATA_SECTION_NODE, i);
    i = seekString(xml, i, "]]>");
    token.push(i);
    i += 3;
    inElement = false;
  } else if (xml.substring(i, i + 7) === "!ENTITY") {
    i += 7;
    token.push(NodeTypes.ENTITY_NODE);
  } else if (xml.substring(i, i + 9) === "!NOTATION") {
    i += 9;
    token.push(NodeTypes.NOTATION_NODE);
  }
  return [i, inElement, token as TokenWithStart];
};

export const onShorthandCDATA = (
  xml: string,
  i: number,
  inElement: boolean
): ParseReturnWithToken => {
  i += 1;
  const token: InternalToken = [NodeTypes.CDATA_SECTION_NODE, i];
  i = seekString(xml, i, "]>");
  token.push(i);
  i += 2;
  inElement = false;
  return [i, inElement, token as TokenWithStart];
};

export const onText = (
  xml: string,
  i: number,
  jsx: boolean = false
): ParseReturnWithToken => {
  const token: InternalToken = [NodeTypes.TEXT_NODE, i];
  const chars = ["<"];
  if (jsx) chars.push(JSX_INLINE[0]);
  i = seekChar(xml, i, chars);

  if (token[1] === i && xml[i] === JSX_INLINE[0]) {
    i++;
    token[0] = NodeTypes.JSX;
    token[1] = i;
    i = seekJSExpression(xml, i);
    token.push(i);
    i++;
  } else {
    token.push(i);
  }
  return [i, false, token as TokenWithStart];
};

export const onBlackhole = (
  xml: string,
  i: number,
  inElement: boolean,
  untilToken: Token
): ParseReturnWithToken => {
  const token: InternalToken = [NodeTypes.TEXT_NODE, i];
  const untilTokenOne = untilToken[1];
  const untilTokenTwo = untilToken[2];
  if (untilTokenOne === undefined || untilTokenTwo === undefined) {
    throw Error(`Internal error`);
  }

  const closingTag = `</${xml.substring(untilTokenOne, untilTokenTwo)}`;
  i = seekString(xml, i, closingTag);
  token.push(i);
  return [i, true, token as TokenWithStart];
};

export const HTML_SELF_CLOSING_ELEMENTS = [
  "area",
  "base",
  "br",
  "col",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "command",
  "keygen",
  "source",
];

const onHTMLSelfClosingElement = (
  xml: string,
  tokens: Token[]
): undefined | TokenWithoutStart => {
  const token = findLastNodeType(tokens, NodeTypes.ELEMENT_NODE);
  if (token && token.length > 2) {
    const tokenOne = token[1];
    const tokenTwo = token[2];
    if (tokenOne === undefined || tokenTwo === undefined) {
      throw Error(`Internal error`);
    }
    const tagName = xml.substring(tokenOne, tokenTwo).toLowerCase(); // lowercase because HTML elements are case-insensitive
    if (HTML_SELF_CLOSING_ELEMENTS.indexOf(tagName) !== -1) {
      return [NodeTypes.CLOSE_ELEMENT];
    }
  }
};

const findLastNodeType = (tokens: Token[], nodeType: number) => {
  for (var i = tokens.length - 1; i >= 0; --i) {
    if (tokens[i][0] === nodeType) return tokens[i];
  }
};

const defaultBlackholes = ["script", "style"];

type Options = {
  /**
   * Blackholes are our term for elements like `<script>` or `<style>` that could contain
   * arbitrary content, and these elements only end when that element is closed, not when
   * another element opens/closes.
   *
   * Ie, "<script> <style> </script>" will be parsed as <script> with a text node of " <style> ".
   */
  blackholes?: string[];
  jsx?: boolean;
  html?: boolean;
};

const defaultOptions = {
  blackholes: defaultBlackholes,
  jsx: false,
  html: false,
};

export type InternalToken = [NODE_TYPE?, number?, number?, number?, number?];

export type TokenWithStart = [
  (
    | NODE_TYPES["CDATA_SECTION_NODE"]
    | NODE_TYPES["COMMENT_NODE"]
    | NODE_TYPES["DOCUMENT_FRAGMENT_NODE"]
    | NODE_TYPES["DOCUMENT_NODE"]
    | NODE_TYPES["ENTITY_REFERENCE_NODE"]
    | NODE_TYPES["JSX"]
    | NODE_TYPES["PROCESSING_INSTRUCTION_NODE"]
    | NODE_TYPES["TEXT_NODE"]
    | NODE_TYPES["XML_DECLARATION"]
  ),
  number,
  number?
];

export type TokenAttribute = [
  NODE_TYPES["ATTRIBUTE_NODE"] | NODE_TYPES["JSX_ATTRIBUTE"],
  number, // In HTML the attribute name start index. In JSX either (1) the start index of the prop name, or (2) the value of a spread ie, "{...obj}".
  number, // In HTML the attribute name end index. In JSX either (1) the end index of the prop name, or (2) the value of a spread ie, "{...obj}".
  number?, // values are optional in HTML5 (if there's no value it's treated as boolean)
  number?
];

export type TokenWithOptionalStart = [
  NODE_TYPES["ELEMENT_NODE"],
  number?, // start and end are optional because of React Fragment nodes <>
  number?
];

export type TokenWithoutStart = [
  | NODE_TYPES["DOCUMENT_TYPE_NODE"]
  | NODE_TYPES["ENTITY_NODE"]
  | NODE_TYPES["CLOSE_ELEMENT"]
  | NODE_TYPES["NOTATION_NODE"]
]; // closing element

export type Token =
  | TokenWithStart
  | TokenWithOptionalStart
  | TokenWithoutStart
  | TokenAttribute;

type ParseReturnWithToken = [number, boolean, TokenWithStart | TokenAttribute];

type ParseReturnWithoutToken = [number, boolean];

// his divine shadow
const Lexx = (xml: string, options?: Options) => {
  const useOptions = {
    ...defaultOptions,
    ...options,
  };

  const tokens: Token[] = [];
  let i: number = 0;
  let char;
  let token;
  let debugExitAfterLoops = Math.min(xml.length, 1073741824); // an arbitrary large number
  let inElement: boolean = false;

  while (i < xml.length) {
    char = xml[i];
    debugExitAfterLoops--;
    if (debugExitAfterLoops < 0)
      throw Error(
        "Congratulations, you probably found a bug in xml-zero-lexer! Please raise an issue on https://github.com/holloway/xml-zero.js/issues with your XML, which was: " +
          xml
      );

    if (!inElement) {
      // text node
      if (char !== "<") {
        [i, inElement, token] = onText(xml, i, useOptions.jsx);
        tokens.push(token);
      } else {
        // element starts again
        inElement = true;
      }
    }
    // CAREFUL don't refactor to join following `if` with preceding `if` to make this an `else if` because
    // in above `inElement` can be set `true`, making both branches possible.
    if (inElement) {
      switch (char) {
        case "<":
          i++;
          char = xml[i];
          switch (char) {
            case "/":
              inElement = false;
              if (xml[i + 1] === ">") {
                // a React Fragment </> closing tag without a name
                i++;
              }
              [i, inElement, token] = onClose(xml, i, inElement);
              tokens.push(token);
              break;
            case "?":
              [i, inElement, token] = onQuestionElement(xml, i);
              tokens.push(token);
              break;
            case "!":
              [i, inElement, token] = onExclamation(xml, i, inElement);
              tokens.push(token);
              break;
            case "[":
              [i, inElement, token] = onShorthandCDATA(xml, i, inElement);
              tokens.push(token);
              break;
            case ">":
              [i, inElement, token] = onElement(xml, i, inElement);
              tokens.push(token);

              break;
            default:
              [i, inElement, token] = onElement(xml, i, inElement);
              tokens.push(token);
              break;
          }
          break;
        case "/":
          if (xml[i + 1] === ">") {
            inElement = false;
            [i, inElement, token] = onClose(xml, i, inElement);
            tokens.push(token);
          } else {
            // in an element finding a "/" between attributes but not at end. weird. ignore.
            i++;
          }
          break;
        case "?":
        case ">":
          [i, inElement] = onEndTag(xml, i);
          const lastElement = findLastNodeType(tokens, NodeTypes.ELEMENT_NODE);
          const lastElementOne = lastElement ? lastElement[1] : undefined;
          const lastElementTwo = lastElement ? lastElement[2] : undefined;
          if (
            lastElement &&
            lastElementOne !== undefined &&
            lastElementTwo !== undefined &&
            useOptions.blackholes.indexOf(
              xml.substring(lastElementOne, lastElementTwo)
            ) !== -1
          ) {
            [i, inElement, token] = onBlackhole(xml, i, inElement, lastElement);
            tokens.push(token);
          }
          if (useOptions.html) {
            token = onHTMLSelfClosingElement(xml, tokens);
            if (token) {
              tokens.push(token);
            }
          }
          break;
        case " ":
        case "\t":
        case "\r":
        case "\n": // ignore whitespace inside element between attributes or before end
          i++;
          break;
        default:
          [i, inElement, token] = onAttribute(xml, i, inElement);
          tokens.push(token);
          if (!inElement && useOptions.html) {
            token = onHTMLSelfClosingElement(xml, tokens);
            if (token) {
              tokens.push(token);
            }
          }
          break;
      }
    }
  }
  return tokens;
};

export default Lexx;
