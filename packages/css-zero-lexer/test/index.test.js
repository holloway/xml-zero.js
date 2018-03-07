import Lexx, { NodeTypes, NodeTypeKeys } from "../src/index";
import { isEqual } from 'lodash';

export const resolve = (css: string, token: Array<number>) => {
  if (!token || (token.length - 1) % 2 !== 0)
    return "Invalid 'token' variable: " + token;
  return [
    NodeTypeKeys[token[0]],
    ...Array.apply(null, Array((token.length - 1) / 2)).map((w, pairIndex) => {
      const i = 1 + pairIndex * 2;
      return css.substring(token[i], token[i + 1]);
    })
  ];
};

const resolveNodes = (css, tokens) => {
  return tokens.map(token => resolve(css, token));
}

const resolveNodeNumber = (css: string, token: Array<number>) => {
  return [NodeTypeKeys[token[0]], token.slice(1)];
};

const resolveNodesNumbers = (css, tokens) => {
  if (!tokens || !tokens.map) return `Not structured. Was ` + tokens;
  return tokens.map(token => resolveNodeNumber(css, token));
};

var cases = [
  {
    desc: "1 comment",
    css: "/* comment */",
    lex: [[NodeTypes.COMMENT_NODE, 2, 11]]
  },
  {
    desc: "2 selector",
    css: "text",
    lex: [[NodeTypes.SELECTOR_NODE, 0, 4]]
  },
  {
    desc: "3. selector",
    css: "text ", // we exclude whitespace
    lex: [[NodeTypes.SELECTOR_NODE, 0, 4]]
  },
  {
    desc: "3 comment and text",
    css: "/*comment*/text",
    lex: [[NodeTypes.COMMENT_NODE, 2, 9], [NodeTypes.SELECTOR_NODE, 11, 15]]
  },
  {
    desc: "4 comment and whitespace and text",
    css: "/*comment*/ text",
    lex: [[NodeTypes.COMMENT_NODE, 2, 9], [NodeTypes.SELECTOR_NODE, 12, 16]]
  },
  {
    desc: "5 whitespace comment and whitespace and text",
    css: " /*comment*/ text",
    lex: [[NodeTypes.COMMENT_NODE, 3, 10], [NodeTypes.SELECTOR_NODE, 13, 17]]
  },
  {
    desc: "6 whitespace text and comment",
    css: " text /*comment*/",
    lex: [[NodeTypes.SELECTOR_NODE, 1, 5], [NodeTypes.COMMENT_NODE, 8, 15]]
  },
  {
    desc: "7 whitespace text and comment followed by whitespace",
    css: " text /*comment*/ ",
    lex: [[NodeTypes.SELECTOR_NODE, 1, 5], [NodeTypes.COMMENT_NODE, 8, 15]]
  },
  {
    desc: "8 two texts",
    css: " text; text;",
    lex: [[NodeTypes.SELECTOR_NODE, 1, 5], [NodeTypes.SELECTOR_NODE, 7, 11]]
  },
  {
    desc: "9 two texts",
    css: " text; text {};",
    lex: [[NodeTypes.SELECTOR_NODE, 1, 5], [NodeTypes.SELECTOR_NODE, 7, 11], [NodeTypes.CLOSE_RULE]]
  },

  // {
  //   desc: "whitespace comment and whitespace and text",
  //   css: " /*comment*/ text; text;",
  //   lex: [[NodeTypes.COMMENT_NODE, 3, 10], [NodeTypes.SELECTOR_NODE, 13, 18], [NodeTypes.SELECTOR_NODE, 19, 25]]
  // }
  // {
  //   desc: "text",
  //   css: "/* comment */text",
  //   lex: [[NodeTypes.COMMENT_NODE, 2, 11], [NodeTypes.COMMENT_NODE, 2, 11]]
  // }
];

describe("lexes", async () =>
  cases.forEach((eachCase, i) => {
    let tokens;
    try {
      tokens = Lexx(eachCase.css);
    } catch (e) {
      console.log(e);
    }

    test(`${eachCase.desc} ${eachCase.css} [${tokens ? resolveNodes(eachCase.css, tokens).join(" | ") : ''}]`, async () => {
      let result;
      try {
        result = Lexx(eachCase.css);
      } catch (e) {
        console.log(e);
      }

      if (!isEqual(tokens, eachCase.lex)) {
        console.log("Not equal");
        console.log(resolveNodesNumbers(eachCase.css, result));
        console.log("after");
        try {
          result = Lex(eachCase.css);
        } catch (e) { }
        if (result) {
          console.log("Result:", result, " from ", eachCase.css);
          console.log(resolveNodes(eachCase.css, result));
        }
      }

      expect(result).toEqual(eachCase.lex);
    });
  }));

