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
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
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

export const resolve = (xml: string, node: Array<number>) => {
  if (!node || (node.length - 1) % 2 !== 0)
    return "Invalid 'node' variable: " + node;
  return [
    NodeTypeKeys[node[0]],
    ...Array.apply(null, Array((node.length - 1) / 2)).map((w, pairIndex) => {
      const i = 1 + pairIndex * 2;
      return xml.substring(node[i], node[i + 1]);
    })
  ];
};

export const resolveNodes = (xml, nodes) =>
  nodes.map(node => resolve(xml, node));

export const resolveNodeNumber = (xml: string, node: Array<number>) => {
  return [NodeTypeKeys[node[0]], node.slice(1)];
};

export const resolveNodesNumbers = (xml, nodes) => {
  if (!nodes || !nodes.map) return `Not structured. Was ` + nodes;
  return nodes.map(node => resolveNodeNumber(xml, node));
};

export const onQuestionElement = (xml: string, i: number, mode: number) => {
  i++;
  const node = [NodeTypes.PROCESSING_INSTRUCTION_NODE, i];
  i = seekChar(xml, i, [">", "?", ...WHITESPACE]);
  if (xml[i] === ">" && xml[i - 1] === "/") {
    i--;
  }
  node.push(i);

  if (xml.substring(node[1], node[2]) === "xml") {
    // it's actually an XML declaration
    node[0] = NodeTypes.XML_DECLARATION;
  }
  i = seekNotChar(xml, i, ["?", ">", ...WHITESPACE]);
  if (xml[i] === "?") i++;

  return [i, WHITESPACE.indexOf(xml[i]) === -1, node];
};

export const onAttribute = (xml: string, i: number, inElement: number) => {
  // console.log("onAttribute");
  const node = [NodeTypes.ATTRIBUTE_NODE];
  if (QUOTES.indexOf(xml[i]) !== -1) {
    // console.log("attribute with quoted key");
    i++;
    node.push(i);
    i = seekChar(xml, i, [xml[node[1] - 1]]);
    node.push(i); // end of attribute name
    i++; // skip quote
  } else if (xml[i] === "[" && WHITESPACE.indexOf(xml[i + 1]) !== -1) {
    node.push(i);
    i = seekString(xml, i, "]>");
    i += 1;
    node.push(i); // end of attribute name
  } else {
    node.push(i);
    i = seekChar(xml, i, ["=", ">", ...WHITESPACE]);
    node.push(i); // end of attribute name
  }

  if (xml[i] === ">") {
    // valueless attribute at the end of element so exit early
    //console.log("valueless attribute at end?", xml[i]);
    if (xml[i - 1] === "?") {
      node[2]--;
    }
    i++;
    return [i, false, node];
  }
  const notWhitespace = seekNotChar(xml, i, WHITESPACE);
  if (xml[notWhitespace] !== "=") {
    // console.log("valueless attribute!");
    return [i, inElement, node];
  }
  i = notWhitespace + 1;
  const enclosed = seekNotChar(xml, i, WHITESPACE);
  const isEnclosed = QUOTES.indexOf(xml[i]) !== -1;
  // console.log("enclosed?", enclosed);
  if (isEnclosed) {
    // surrounded by quotes
    i++;
    node.push(i);
    i++;
    i = seekChar(xml, i, xml[enclosed]);
    node.push(i);
    i++;
  } else {
    // not surrounded by quotes
    // console.log("quoteless attribute");
    node.push(i);
    i = seekChar(xml, i, [">", ...WHITESPACE]);
    if (xml[i] === ">" && xml[i - 1] === "?") {
      i--;
    }
    node.push(i);
  }

  i = seekNotChar(xml, i, WHITESPACE);
  return [i, true, node];
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
  const node = [NodeTypes.CLOSE_ELEMENT];
  i = seekChar(xml, i, [">", ...WHITESPACE]);
  i++;
  return [i, false, node];
};

export const onElement = (xml: string, i: number, inElement: boolean) => {
  const node = [NodeTypes.ELEMENT_NODE, i];
  i = seekChar(xml, i, [">", ...WHITESPACE]);
  const selfClosing = xml[i] === ">" && xml[i - 1] === "/";
  if (selfClosing) {
    i--;
  }
  node.push(i);
  return [i, true, node];
};

export const onExclamation = (xml: string, i: number, inElement: boolean) => {
  // console.log("excla!", xml[i]);
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
  }
  return [i, inElement, token];
};

export const onText = (xml: string, i: number, inElement: boolean) => {
  const node = [NodeTypes.TEXT_NODE, i];
  i = seekChar(xml, i, ["<"]);
  node.push(i);
  //console.log("ON TEXT", resolve(xml, node), xml[i]);

  return [i, inElement, node];
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
