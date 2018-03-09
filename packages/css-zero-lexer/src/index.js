// @flow
export const NodeTypes = {
  INSTRUCTION_NODE: 0,
  OPEN_RULE: 1,
  CLOSE_RULE: 2,
  SELECTOR_NODE: 3,
  PROPERTY_NODE: 4,
  CLOSE_PROPERTY: 5,
  COMMENT_NODE: 6,
  SELECTOR_SEPARATOR: 7 // comma character between selectors
};

export const NodeTypeKeys = Object.keys(NodeTypes).sort(
  (a, b) => NodeTypes[a] - NodeTypes[b]
);

const COMMENT = ["/*", "*/"];
const SASS_COMMENT = ["//", ["\n", "\r"]];

const WHITESPACE = [" ", "\r", "\n", "\t"];

const QUOTES = ['"', "'"];

const seekChar = (
  css: string,
  i: number,
  searchChars: Array<string>
): number => {
  while (searchChars.indexOf(css[i]) === -1) {
    i++;
    if (i > css.length) return i - 1;
  }
  return i;
};

const NESTING_TOKENS = [
  ["[", "]"], // attr selector
  ["(", ")"], // eg for :not()
  ['"', '"'],
  ["'", "'"]
];

const NESTING_OPEN = NESTING_TOKENS.map(pair => pair[0]);
const NESTING_CLOSE = NESTING_TOKENS.map(pair => pair[1]);

const SELECTOR_OR_PROPERTY_TERMINATION = ["{", "}", ",", ";"];

const seekExpression = (css: string, i: number) => {
  const nesting = [];
  const tokens = [];
  let token;

  let exitAfter = 1000000; // At least 10MB of tokens
  let char;
  while (i < css.length) {
    char = css[i];
    if (char === COMMENT[0][0] && css[i + 1] === COMMENT[0][1]) {
      tokens.push([NodeTypes.COMMENT_NODE, i + 2, endOfComment + 2]);
      i = endOfComment + 2;
    } else {
      if (nesting.length === 0) {
        const startI = i;
        i = Math.min(
          seekChar(css, i, [
            ...NESTING_OPEN,
            ...SELECTOR_OR_PROPERTY_TERMINATION
          ]),
          seekString(css, i, COMMENT[0])
        );
        char = css[i];
        if (NESTING_OPEN.indexOf(char) !== -1) {
          nesting.push(NESTING_CLOSE[NESTING_OPEN.indexOf(char)]);
        } else {
          // time to leave
          tokens.push([
            NodeTypes.SELECTOR_NODE,
            startI,
            trimWhitespace(css, css.length >= i ? i - 1 : i)
          ]);
          return [i, tokens];
        }
      } else {
        const closeChar = NESTING_CLOSE[nesting[nesting.length - 1]];
        i = seekChar(css, i, [closeChar, ...NESTING_OPEN]);
        char = css[i];
        if (char === closeChar) {
          nesting.pop();
        } else if (NESTING_OPEN.indexOf(char)) {
          nesting.push(char);
        }
        i++;
      }
    }

    exitAfter--;
    if (exitAfter === 0) throw Error("Exiting after too many loops");
  }
  return [i, tokens];
};

const seekBackNotChar = (
  css: string,
  i: number,
  searchChars: Array<string>
) => {
  let exitAfter = 100000; // At least 1MB of tokens
  while (i > 0 && searchChars.indexOf(css[i]) !== -1) {
    i--;
    exitAfter--;
    if (exitAfter === 0) throw Error("Exiting after too many loops");
  }
  return i + 1;
};

const trimWhitespace = (css: string, i: number) =>
  seekBackNotChar(css, i, WHITESPACE);

const seekString = (css: string, i: number, searchString: string): number => {
  i = css.indexOf(searchString, i);
  if (i === -1) i = css.length;
  return i;
};

const onComment = (css: string, i: number) => {
  i++;
  const token = [NodeTypes.COMMENT_NODE, i];
  i = seekString(css, i, "*/");
  token.push(i);
  i += 2;
  return [i, token];
};

const onExpression = (css: string, i: number) => {
  let tokens;
  [i, tokens] = seekExpression(css, i);
  return [i, tokens];
};

const onClose = (css: string, i: number) => {
  const token = [NodeTypes.CLOSE_RULE];
  i++;
  return [i, token];
};

const defaultOptions = {
  i: 0
};

type Options = {};

// his divine shadow
const Lexx = (css: string, options: ?Options) => {
  const useOptions = {
    ...defaultOptions,
    ...options
  };

  const tokens = [];
  let i = useOptions.i || 0; // Number.MAX_SAFE_INTEGER is 9007199254740991 so that's 9007199 gigabytes of string and using integers makes sense
  let char;
  let token;
  let onExpressionTokens;
  let ambiguousTokens = [];
  let debugExitAfterLoops = 1073741824; // an arbitrary large number

  while (i < css.length) {
    char = css[i];
    debugExitAfterLoops--;
    if (debugExitAfterLoops < 0) throw Error("Too many loops");

    if (char === "/" && css[i + 1] === "*") {
      i++;
      [i, token] = onComment(css, i);
      tokens.push(token);
    } else {
      switch (char) {
        case " ":
        case "\t":
        case "\r":
        case "\n":
          i++;
          break;
        case "{":
          i++;
          ambiguousTokens.forEach(
            token => (token[0] = NodeTypes.SELECTOR_NODE)
          );
          ambiguousTokens = [];
          token = [NodeTypes.OPEN_RULE];
          tokens.push(token);
          break;
        case ",":
          token = [NodeTypes.SELECTOR_SEPARATOR];
          tokens.push(token);
          i++;
          break;
        case ";":
          i++;
          ambiguousTokens.forEach(
            token => (token[0] = NodeTypes.PROPERTY_NODE)
          );
          ambiguousTokens = [];
          token = [NodeTypes.CLOSE_PROPERTY];
          tokens.push(token);
          break;
        case "}":
          [i, token] = onClose(css, i);
          ambiguousTokens.forEach(
            token => (token[0] = NodeTypes.PROPERTY_NODE)
          );
          tokens.push(token);
          ambiguousTokens = [];
          break;
        default:
          // properties or selectors

          [i, onExpressionTokens] = onExpression(css, i);

          onExpressionTokens.forEach(token => {
            ambiguousTokens.push(token);
            tokens.push(token);
          });

          if (css[i] === "}") {
            let hasPropertyNode = false;
            ambiguousTokens.forEach(token => {
              if (token[0] === NodeTypes.SELECTOR_NODE) {
                token[0] === NodeTypes.PROPERTY_NODE;
                hasPropertyNode = true;
              }
            });
            if (hasPropertyNode) {
              tokens.push([NodeTypes.CLOSE_PROPERTY]);
            }
          }
          break;
      }
    }
  }
  ambiguousTokens.forEach(token => {
    if (token[0] === NodeTypes.SELECTOR_NODE) {
      token[0] = NodeTypes.PROPERTY_NODE;
    }
  });
  return tokens;
};

export default Lexx;
