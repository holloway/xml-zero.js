import Lexx, { NodeTypes, NodeTypeKeys } from "../src/index";
import { isEqual } from "lodash";

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
};

const resolveNodeNumber = (css: string, token: Array<number>) => {
  return [NodeTypeKeys[token[0]], token.slice(1)];
};

const resolveNodesNumbers = (css, tokens) => {
  if (!tokens || !tokens.map) return `Not structured. Was ` + tokens;
  return tokens.map(token => resolveNodeNumber(css, token));
};

var cases = [
  {
    desc: "comment",
    css: "/* comment */",
    lex: [[NodeTypes.COMMENT_NODE, 2, 11]]
  },
  {
    desc: "property",
    css: "text",
    lex: [[NodeTypes.PROPERTY_NODE, 0, 4]]
  },
  {
    desc: "property, whitespace",
    css: "text ", // we exclude whitespace
    lex: [[NodeTypes.PROPERTY_NODE, 0, 4]]
  },
  {
    desc: "comment and property",
    css: "/*comment*/text",
    lex: [[NodeTypes.COMMENT_NODE, 2, 9], [NodeTypes.PROPERTY_NODE, 11, 15]]
  },
  {
    desc: "property and comment and property",
    css: "prop/*comment*/text",
    lex: [
      [NodeTypes.PROPERTY_NODE, 0, 4],
      [NodeTypes.COMMENT_NODE, 6, 13],
      [NodeTypes.PROPERTY_NODE, 15, 19]
    ]
  },
  {
    desc: "comment and whitespace and property",
    css: "/*comment*/ text",
    lex: [[NodeTypes.COMMENT_NODE, 2, 9], [NodeTypes.PROPERTY_NODE, 12, 16]]
  },
  {
    desc: "whitespace, comment, property",
    css: " /*comment*/ text",
    lex: [[NodeTypes.COMMENT_NODE, 3, 10], [NodeTypes.PROPERTY_NODE, 13, 17]]
  },
  {
    desc: "Whitespace, property, comment",
    css: " text /*comment*/",
    lex: [[NodeTypes.PROPERTY_NODE, 1, 5], [NodeTypes.COMMENT_NODE, 8, 15]]
  },
  {
    desc: "Property then comment then whitespace",
    css: " text /*comment*/ ",
    lex: [[NodeTypes.PROPERTY_NODE, 1, 5], [NodeTypes.COMMENT_NODE, 8, 15]]
  },
  {
    desc: "whitespace, one property",
    css: " text;",
    lex: [[NodeTypes.PROPERTY_NODE, 1, 5], [NodeTypes.CLOSE_PROPERTY]]
  },
  {
    desc: "Whitespace then two properties",
    css: " text; text;",
    lex: [
      [NodeTypes.PROPERTY_NODE, 1, 5],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.PROPERTY_NODE, 7, 11],
      [NodeTypes.CLOSE_PROPERTY]
    ]
  },
  {
    desc: "Two properties with whitespace",
    css: " text; text; ",
    lex: [
      [NodeTypes.PROPERTY_NODE, 1, 5],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.PROPERTY_NODE, 7, 11],
      [NodeTypes.CLOSE_PROPERTY]
    ]
  },
  {
    desc: "One property, one selector",
    css: " text; text{",
    lex: [
      [NodeTypes.PROPERTY_NODE, 1, 5],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.SELECTOR_NODE, 7, 11],
      [NodeTypes.OPEN_RULE]
    ]
  },
  {
    desc: "Two properties, the second has a comment in the middle",
    css: " text; te/* comment */xt",
    lex: [
      [NodeTypes.PROPERTY_NODE, 1, 5],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.PROPERTY_NODE, 7, 9],
      [NodeTypes.COMMENT_NODE, 11, 20],
      [NodeTypes.PROPERTY_NODE, 22, 24]
    ]
  },
  {
    desc: "Whitespace, one property, one selector",
    css: " text; text{}",
    lex: [
      [NodeTypes.PROPERTY_NODE, 1, 5],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.SELECTOR_NODE, 7, 11],
      [NodeTypes.OPEN_RULE],
      [NodeTypes.CLOSE_RULE]
    ]
  },
  {
    desc: "Whitespace, comment, whitespace, and two properties",
    css: " /*comment*/ text; text;",
    lex: [
      [NodeTypes.COMMENT_NODE, 3, 10],
      [NodeTypes.PROPERTY_NODE, 13, 17],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.PROPERTY_NODE, 19, 23],
      [NodeTypes.CLOSE_PROPERTY]
    ]
  },
  {
    desc: "Comment with property",
    css: "/* comment */text",
    lex: [[NodeTypes.COMMENT_NODE, 2, 11], [NodeTypes.PROPERTY_NODE, 13, 17]]
  },
  {
    desc: "Selector with property with ;",
    css: "text { prop; }",
    lex: [
      [NodeTypes.SELECTOR_NODE, 0, 4],
      [NodeTypes.OPEN_RULE],
      [NodeTypes.PROPERTY_NODE, 7, 11],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.CLOSE_RULE]
    ]
  },
  {
    desc: "Selector with property without ;",
    css: "text { prop }",
    lex: [
      [NodeTypes.SELECTOR_NODE, 0, 4],
      [NodeTypes.OPEN_RULE],
      [NodeTypes.PROPERTY_NODE, 7, 11],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.CLOSE_RULE]
    ]
  },
  {
    desc: "Selector with properties",
    css: "text { prop; prop2: value }",
    lex: [
      [NodeTypes.SELECTOR_NODE, 0, 4],
      [NodeTypes.OPEN_RULE],
      [NodeTypes.PROPERTY_NODE, 7, 11],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.PROPERTY_NODE, 13, 25],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.CLOSE_RULE]
    ]
  },
  {
    desc: "Sass nested properties",
    css: "text { prop; prop2 { value } }",
    lex: [
      [NodeTypes.SELECTOR_NODE, 0, 4],
      [NodeTypes.OPEN_RULE],
      [NodeTypes.PROPERTY_NODE, 7, 11],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.SELECTOR_NODE, 13, 18],
      [NodeTypes.OPEN_RULE],
      [NodeTypes.PROPERTY_NODE, 21, 26],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.CLOSE_RULE],
      [NodeTypes.CLOSE_RULE]
    ]
  },
  {
    desc: "CSS comma selectors",
    css: "text selector1, text selector2 { prop; prop2 { value } }",
    lex: [
      [NodeTypes.SELECTOR_NODE, 0, 14],
      [NodeTypes.SELECTOR_SEPARATOR],
      [NodeTypes.SELECTOR_NODE, 16, 30],
      [NodeTypes.OPEN_RULE],
      [NodeTypes.PROPERTY_NODE, 33, 37],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.SELECTOR_NODE, 39, 44],
      [NodeTypes.OPEN_RULE],
      [NodeTypes.PROPERTY_NODE, 47, 52],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.CLOSE_RULE],
      [NodeTypes.CLOSE_RULE]
    ]
  },
  {
    desc: "CSS comma selectors with comment",
    css:
      "text selector1, text selector2 { prop; prop2 { value } /* comment */ }",
    lex: [
      [NodeTypes.SELECTOR_NODE, 0, 14],
      [NodeTypes.SELECTOR_SEPARATOR],
      [NodeTypes.SELECTOR_NODE, 16, 30],
      [NodeTypes.OPEN_RULE],
      [NodeTypes.PROPERTY_NODE, 33, 37],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.SELECTOR_NODE, 39, 44],
      [NodeTypes.OPEN_RULE],
      [NodeTypes.PROPERTY_NODE, 47, 52],
      [NodeTypes.CLOSE_PROPERTY],
      [NodeTypes.CLOSE_RULE],
      [NodeTypes.COMMENT_NODE, 57, 66],
      [NodeTypes.CLOSE_RULE]
    ]
  }
];

describe("lexes", async () =>
  cases.forEach((eachCase, i) => {
    let tokens;
    try {
      tokens = Lexx(eachCase.css);
    } catch (e) {
      console.log(e);
    }

    test(`${eachCase.desc} ${eachCase.css} [${
      tokens ? resolveNodes(eachCase.css, tokens).join(" | ") : ""
    }]`, async () => {
      let result;
      try {
        result = Lexx(eachCase.css);
      } catch (e) {
        console.log(e);
      }

      if (!isEqual(tokens, eachCase.lex)) {
        console.log(resolveNodesNumbers(eachCase.css, result));
        try {
          result = Lex(eachCase.css);
        } catch (e) {}
        if (result) {
          console.log("Result:", result, " from ", eachCase.css);
          console.log(resolveNodes(eachCase.css, result));
        }
      }

      expect(result).toEqual(eachCase.lex);
    });
  }));
