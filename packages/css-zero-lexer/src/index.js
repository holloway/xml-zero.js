// @flow
export const NodeTypes = {
  INSTRUCTION_NODE: 0,
  SELECTOR_NODE: 1,
  PROPERTY_NODE: 2,
  COMMENT_NODE: 3,
  CLOSE_RULE: 4,
};

export const NodeTypeKeys = Object.keys(NodeTypes).sort(
  (a, b) => NodeTypes[a] - NodeTypes[b]
);

const COMMENT = ['/*', '*/'];
const SASS_COMMENT = ['//', ['\n', '\r']];

const WHITESPACE = [" ", "\r", "\n", "\t"];

const QUOTES = ['"', "'"];

const seekChar = (
  css: string,
  i: number,
  searchChars: Array<string>
): number => {
  while (searchChars.indexOf(css[i]) === -1) {
    i++;
    if (i > css.length) return i;
  }
  return i;
};

const NESTING_TOKENS = [
  ['[', ']'], // attr selector
  ['(', ')'], // eg for :not()
  ['"', '"'],
  ["'", "'"],
];

const NESTING_OPEN = NESTING_TOKENS.map(pair => pair[0]);
const NESTING_CLOSE = NESTING_TOKENS.map(pair => pair[1]);

const SELECTOR_TERMINATION = ['{', ',', ';'];


const seekCSSExpression = (css: string, i: number) => {
  const nesting = [];

  let exitAfter = 1000000; // At least 10MB of tokens
  let char;
  while (i < css.length) {

    char = css[i];
    if (css)
      if (nesting.length === 0) {
        i = Math.min(
          seekChar(css, i, [...NESTING_OPEN, ...SELECTOR_TERMINATION]),
          seekString(css, i, COMMENT[0])
        );
        char = css[i];
        if (char === '/' && css[i + 1] === '*') {
          i--;
          return i;
        } else if (NESTING_OPEN.indexOf(i) !== -1) {
          nesting.push(NESTING_CLOSE[NESTING_OPEN.indexOf(char)]);
        } else {
          return i;
        }
        i++;
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

    exitAfter--;
    if (exitAfter === 0) throw Error("Exiting after too many loops");
  }
  return i;
};

const seekBackNotChar = (css: string, i: number, searchChars: Array<string>) => {
  let exitAfter = 100000; // At least 1MB of tokens
  console.log(css[i] === undefined ? 'undef' : 'wt', 'checking1', i, css.length, '+++++', css[i], `[${css.substring(i)}]`, searchChars);

  while (i > 0 && searchChars.indexOf(css[i]) !== -1) {
    i--;
    exitAfter--;
    if (exitAfter === 0) throw Error("Exiting after too many loops");
  }
  return i + 1;
};


const seekString = (css: string, i: number, searchString: string): number => {
  i = css.indexOf(searchString, i);
  if (i === -1) i = css.length;
  return i;
};

const onComment = (css: string, i: number) => {
  i++;
  const token = [NodeTypes.COMMENT_NODE, i];
  i = seekString(css, i, '*/');
  token.push(i);
  i += 2;
  return [i, token]
}

const onSelector = (css: string, i: number) => {
  const token = [NodeTypes.SELECTOR_NODE, i];
  i = seekCSSExpression(css, i);
  if ([undefined, ...WHITESPACE, ...SELECTOR_TERMINATION].indexOf(css[i]) !== -1) {
    // trim trailing whitespace
    const iWithoutWhitespace = seekBackNotChar(css, i - 1, WHITESPACE);
    token.push(iWithoutWhitespace);
  } else {
    token.push(i);
  }
  i++;
  return [i, token];
}

const onClose = (css: string, i: number) => {
  const token = [NodeTypes.CLOSE_RULE];
  i++;
  return [i, token];
}

const defaultOptions = {}

type Options = {}

// his divine shadow
const Lexx = (css: string, options: ?Options) => {
  const useOptions = {
    ...defaultOptions,
    ...options
  };

  const tokens = [];
  let i = 0; // Number.MAX_SAFE_INTEGER is 9007199254740991 so that's 9007199 gigabytes of string and using integers makes sense
  let char;
  let token;
  let textTokens;
  let debugExitAfterLoops = 1073741824; // an arbitrary large number

  while (i < css.length) {
    char = css[i];
    debugExitAfterLoops--;
    if (debugExitAfterLoops < 0) throw Error("Too many loops");

    if (char === '/' && css[i + 1] === '*') {
      i++;
      [i, token] = onComment(css, i);
      tokens.push(token);
    } else {
      switch (char) {
        case ' ':
        case '\t':
        case '\r':
        case '\n':
        case ';':
          i++;
          break;
        case '}':
          [i, token] = onClose(css, i);
          tokens.push(token)
          console.log('close', i, css[i], css.substring(i));
          break;
        default:
          // console.log('char', `[${char}]`)
          [i, token] = onSelector(css, i);
          tokens.push(token);

          break;
      }

    }


  }
  return tokens;
};

export default Lexx;
