export const NodeTypes = {
  XML_DECLARATION: 0, // unofficial, but also makes array indexes line up with values!
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  ENTITY_NODE: 6,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9, // we don't support this Node Type... we'd prefer to just use elements
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11, // don't support this either
  NOTATION_NODE: 12,
  CLOSE_ELEMENT: 13 // unofficial
};

const NodeTypeKeys = Object.keys(NodeTypes); // technically keys are unordered so this should be sorted by NodeTypes' integer.

const WHITESPACE = [" ", "\r", "\n", "\t"];

const QUOTES = ['"', "'"];

const seekNotChar = (xml: string, i: number, searchChars: Array<string>) => {
  while (searchChars.indexOf(xml[i]) !== -1) {
    i++;
    if (i > xml.length) throw Error("Error lexing XML. Unterminated node.");
  }
  return i;
};

const seekChar = (
  xml: string,
  i: number,
  searchChars: Array<string>
): number => {
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

export const resolve = (xml: string, token: Array<number>) => {
  if (!token || (token.length - 1) % 2 !== 0)
    return "Invalid 'token' variable: " + token;
  return [
    NodeTypeKeys[token[0]],
    ...Array.apply(null, Array((token.length - 1) / 2)).map((w, pairIndex) => {
      const i = 1 + pairIndex * 2;
      return xml.substring(token[i], token[i + 1]);
    })
  ];
};

export const resolveNodes = (xml, tokens) =>
  tokens.map(token => resolve(xml, token));

export const resolveNodeNumber = (xml: string, token: Array<number>) => {
  return [NodeTypeKeys[token[0]], token.slice(1)];
};

export const resolveNodesNumbers = (xml, tokens) => {
  if (!tokens || !tokens.map) return `Not structured. Was ` + tokens;
  return tokens.map(token => resolveNodeNumber(xml, token));
};

export const onQuestionElement = (xml: string, i: number, mode: number) => {
  i++;
  const token = [NodeTypes.PROCESSING_INSTRUCTION_NODE, i];
  i = seekChar(xml, i, [">", "?", ...WHITESPACE]);
  if (xml[i] === ">" && xml[i - 1] === "/") {
    i--;
  }
  token.push(i);

  if (xml.substring(token[1], token[2]) === "xml") {
    // it's actually an XML declaration
    token[0] = NodeTypes.XML_DECLARATION;
  }
  i = seekNotChar(xml, i, ["?", ">", ...WHITESPACE]);
  if (xml[i] === "?") i++;

  return [i, WHITESPACE.indexOf(xml[i]) === -1, token];
};

export const onAttribute = (xml: string, i: number, inElement: number) => {
  // console.log("onAttribute");
  const token = [NodeTypes.ATTRIBUTE_NODE];
  if (QUOTES.indexOf(xml[i]) !== -1) {
    // console.log("attribute with quoted key");
    i++;
    token.push(i);
    i = seekChar(xml, i, [xml[token[1] - 1]]);
    token.push(i); // end of attribute name
    i++; // skip quote
  } else if (xml[i] === "[" && WHITESPACE.indexOf(xml[i + 1]) !== -1) {
    token.push(i);
    i = seekString(xml, i, "]>");
    i += 1;
    token.push(i); // end of attribute name
  } else {
    token.push(i);
    i = seekChar(xml, i, ["=", ">", ...WHITESPACE]);
    token.push(i); // end of attribute name
  }

  if (xml[i] === ">") {
    // valueless attribute at the end of element so exit early
    //console.log("valueless attribute at end?", xml[i]);
    if (xml[i - 1] === "?") {
      token[2]--;
    }
    i++;
    return [i, false, token];
  }
  const notWhitespace = seekNotChar(xml, i, WHITESPACE);
  if (xml[notWhitespace] !== "=") {
    // console.log("valueless attribute!");
    return [i, inElement, token];
  }
  i = notWhitespace + 1;
  const enclosed = seekNotChar(xml, i, WHITESPACE);
  const isEnclosed = QUOTES.indexOf(xml[i]) !== -1;
  // console.log("enclosed?", enclosed);
  if (isEnclosed) {
    // surrounded by quotes
    i++;
    token.push(i);
    i++;
    i = seekChar(xml, i, xml[enclosed]);
    token.push(i);
    i++;
  } else {
    // not surrounded by quotes
    // console.log("quoteless attribute");
    token.push(i);
    i = seekChar(xml, i, [">", ...WHITESPACE]);
    if (xml[i] === ">" && xml[i - 1] === "?") {
      i--;
    }
    token.push(i);
  }

  i = seekNotChar(xml, i, WHITESPACE);
  return [i, true, token];
};

export const onEndTag = (xml: string, i: number, inElement: boolean) => {
  if (xml[i] === "?") {
    i++;
  }
  i++;
  return [i, false];
};

export const onClose = (xml: string, i: number, inElement: boolean) => {
  // console.log("onClose, starting... ", xml[i], "from", xml);
  const token = [NodeTypes.CLOSE_ELEMENT];
  i = seekChar(xml, i, [">", ...WHITESPACE]);
  i++;
  return [i, false, token];
};

export const onElement = (xml: string, i: number, inElement: boolean) => {
  const token = [NodeTypes.ELEMENT_NODE, i];
  i = seekChar(xml, i, [">", ...WHITESPACE]);
  const selfClosing = xml[i] === ">" && xml[i - 1] === "/";
  if (selfClosing) {
    i--;
  }
  token.push(i);
  return [i, true, token];
};

export const onExclamation = (xml: string, i: number, inElement: boolean) => {
  const token = [];
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
  return [i, inElement, token];
};

export const onShorthandCDATA = (
  xml: string,
  i: number,
  inElement: boolean
) => {
  const token = [];
  i += 1;
  token.push(NodeTypes.CDATA_SECTION_NODE, i);
  i = seekString(xml, i, "]>");
  token.push(i);
  i += 2;
  inElement = false;
  return [i, inElement, token];
};

export const onText = (xml: string, i: number, inElement: boolean) => {
  const token = [NodeTypes.TEXT_NODE, i];
  i = seekChar(xml, i, ["<"]);
  token.push(i);
  //console.log("ON TEXT", resolve(xml, token), xml[i]);

  return [i, inElement, token];
};

// his divine shadow
const Lexx = async (xml: string, debug: boolean) => {
  const tokens = [];
  let i = 0; // Number.MAX_SAFE_INTEGER is 9007199254740991 so that's 9007199 gigabytes of string
  let char;
  let token;
  let debugExitAfterLoops = 100;
  let inElement = false;
  while (i < xml.length) {
    char = xml[i];
    debugExitAfterLoops--;
    if (debugExitAfterLoops < 0) throw Error("Too many loops");

    if (!inElement) {
      // text
      if (char !== "<") {
        // if (debug) console.log("text", char);
        [i, inElement, token] = onText(xml, i, inElement);
        tokens.push(token);
      } else {
        // element starts again
        inElement = true;
      }
    }
    // don't join with above `if` to make this an `else if` because in above `inElement` can be set `true`
    if (inElement) {
      switch (char) {
        case "<":
          i++;
          char = xml[i];
          switch (char) {
            case "/":
              // console.log("CLOSE TAG CLOSE", i, xml[i]);
              inElement = false;
              [i, inElement, token] = onClose(xml, i, inElement);
              tokens.push(token);
              break;
            case "?":
              [i, inElement, token] = onQuestionElement(xml, i, inElement);
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
            default:
              [i, inElement, token] = onElement(xml, i, inElement);
              //if (debug)
              // console.log("after onElement", xml[i], resolve(xml, token));
              tokens.push(token);
              break;
          }
          break;
        case "/":
          // console.log("---------- End slash?");
          if (xml[i + 1] === ">") {
            inElement = false;
            [i, inElement, token] = onClose(xml, i, inElement);
            tokens.push(token);
          }
          break;
        case "?":
        case ">":
          if (debug) console.log("onTagEnd");

          [i, inElement] = onEndTag(xml, i);

          if (debug) console.log("after onTagEnd", xml[i], inElement);

          break;
        case " ":
        case "\t":
        case "\r":
        case "\n": // ignore whitespace inside element between attributes or before end
          i++;
          break;
        default:
          [i, inElement, token] = onAttribute(xml, i, inElement);
          if (debug) console.log("onAttriubte: inElement", inElement);
          tokens.push(token);
          break;
      }
    }
  }
  return tokens;
};

export default Lexx;
