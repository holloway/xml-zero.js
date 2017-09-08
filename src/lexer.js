export const NodeTypes = {
  XML_DECLARATION: 0, // unofficial, but also makes key indexes line up!
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
  CLOSE_NODE: 13 // unofficial
};

const NodeTypeKeys = Object.keys(NodeTypes); // technically keys are unordered so this should be sorted by NodeTypes' integer.

const MODE = {
  TEXT: 1,
  OPEN_ELEMENT: 2,
  OPEN_QUESTION_ELEMENT: 4
};

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

export const resolve = (xml: string, node: Array<number>) => {
  if ((node.length - 1) % 2 !== 0)
    throw Error("Invalid 'node' variable: " + node);
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

export const onQuestionElement = (xml: string, i: number) => {
  i++;
  const node = [NodeTypes.PROCESSING_INSTRUCTION_NODE, i];
  i = seekChar(xml, i, [">", "?", ...WHITESPACE]);
  node.push(i);
  if (
    // it's actually an XML declaration
    xml.length > i &&
    [">", "?", ...WHITESPACE].indexOf(xml[node[1] + 3]) !== -1
  ) {
    node[0] = NodeTypes.XML_DECLARATION;
  }
  i--;
  return [i, node];
};

export const onAttribute = (xml: string, i: number, mode: ?number) => {
  // console.log("onAttribute");
  const node = [NodeTypes.ATTRIBUTE_NODE, i];
  i = seekChar(xml, i, ["=", ">", ...WHITESPACE]);
  node.push(i); // end of attribute name
  if (xml[i] === ">") {
    // valueless attribute at the end of element so exit early
    if (xml[i - 1] === "?") {
      node[2]--;
    }
    i--;
    return [i, node];
  }
  const notWhitespace = seekNotChar(xml, i, WHITESPACE);
  if (xml[notWhitespace] !== "=") {
    // console.log("valueless attribute!");
    return [i, node];
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
  } else {
    // not surrounded by quotes
    node.push(i);
    i = seekChar(xml, i, [">", ...WHITESPACE]);
    if (
      mode === MODE.OPEN_QUESTION_ELEMENT &&
      xml[i] === ">" &&
      xml[i - 1] === "?"
    ) {
      i--;
    }
    node.push(i);
    console.log("ATTR", resolve(xml, node));
    i--;
  }

  // console.log(resolve(xml, node));
  return [i, node];
};

export const onClose = (xml: string, i: number) => {
  const node = [NodeTypes.CLOSE_NODE, i, i + 1];
  i++;
  return [i, node];
};

// his divine shadow
const Lexx = async (xml: string) => {
  const tokens = [];
  let i = 0; // Number.MAX_SAFE_INTEGER is 9007199254740991 so that's 9007199 gigabytes of string
  let char;
  let mode = MODE.TEXT;
  while (i < xml.length) {
    char = xml[i];
    switch (char) {
      case "<":
        i++;
        char = xml[i];
        if (char === "?") {
          mode = MODE.OPEN_QUESTION_ELEMENT;
          let token;
          [i, token] = onQuestionElement(xml, i);
          tokens.push(token);
        } else {
          mode = MODE.OPEN_ELEMENT;
          let token;
          [i, token] = onElement(xml, i);
          tokens.push(token);
        }
        break;
      case "?":
        if (mode === MODE.OPEN_QUESTION_ELEMENT) {
          i++;
        }
      // intentional pass through
      case ">":
        if (
          [MODE.OPEN_ELEMENT, MODE.OPEN_QUESTION_ELEMENT].indexOf(mode) !== -1
        ) {
          // console.log("mode close");
          mode = MODE.TEXT;
          let token;
          [i, token] = onClose(xml, i);
          tokens.push(token);
        }
        break;
      case " ":
      case "\r":
      case "\n":
      case "\t":
        if (mode === MODE.OPEN_ELEMENT) {
          i++;
        }
        break;
      default:
        // console.log("default");
        if (mode === MODE.OPEN_ELEMENT || mode === MODE.OPEN_QUESTION_ELEMENT) {
          // console.log("parse attribute");
          let token;
          [i, token] = onAttribute(xml, i, mode);
          tokens.push(token);
        }
    }
    i++;
    // console.log("about to char loop at ", xml[i], i, xml.length);
  }
  return tokens;
};

export default Lexx;
