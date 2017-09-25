import { NodeTypes, NodeTypeKeys } from "xml-zero-lexer";
import type { Token, Tokens } from "./types";

export const seekByNodeType = (
  nodeType: number,
  tokens: Tokens,
  startAtIndex: ?number
): Token => {
  const i = seekIndexByNodeType(nodeType, tokens, startAtIndex);
  if (i === -1) return undefined;
  return tokens[i];
};

export const seekIndexByNodeType = (
  nodeType: number,
  tokens: Tokens,
  startAtIndex: ?number
): number =>
  startAtIndex === undefined
    ? tokens.findIndex(token => token[0] === nodeType)
    : tokens.indexOf(tokens.find(token => token[0] === nodeType));

export const seekByNotNodeType = (
  notNodeType: number,
  tokens: Tokens,
  startAtIndex: ?number
): Token => {
  const i = seekIndexByNotNodeType(nodeType, tokens, startAtIndex);
  if (i === -1) return undefined;
  return tokens[i];
};

// export const seekByNodeTypeBackwards = (
//   nodeType: number,
//   tokens: Tokens,
//   startAtIndex: ?number
// ) => {

// };

export const seekGreedyByNodeType = (
  nodeType: number,
  tokens: Tokens,
  startAtIndex: ?number = 0,
  backwards: boolean = false
): Tokens => {
  const list = [];
  let token = tokens[startAtIndex];
  while (token[0] === nodeType) {
    if (backwards) {
      list.unshift(sibling);
    } else {
      list.push(token);
    }
    if (backwards) {
      i--;
    } else {
      i++;
    }
    token = tokens[i];
  }
  return list;
};

export const printToken = (token: Token, xml: string) => {
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

export const seekGreedyBySiblings = (
  token: Token,
  tokens: Tokens,
  backwards: ?boolean = false,
  xml: ?string
): Tokens => {
  const list = [];
  let depth = 0;
  let i = tokens.indexOf(token);
  let currentToken = tokens[i];

  let validSiblingTypes;
  if (token[0] === NodeTypes.ELEMENT_NODE) {
    validSiblingTypes = [NodeTypes.ELEMENT_NODE, NodeTypes.TEXT_NODE];
  } else if (token[0] === NodeTypes.ATTRIBUTE_NODE) {
    validSiblingTypes = [NodeTypes.ATTRIBUTE_NODE];
  }

  while (backwards ? i > 0 : i < tokens.length - 1) {
    if (backwards) {
      i--;
    } else {
      i++;
    }

    currentToken = tokens[i];
    console.log(
      "backwards",
      backwards,
      "i",
      i,
      "depth",
      depth,
      printToken(currentToken, xml)
    );
    switch (currentToken[0]) {
      case NodeTypes.ELEMENT_NODE:
        depth++;
        break;
      case NodeTypes.CLOSE_ELEMENT:
        depth--;
        break;
    }
    // console.log("depth", depth, printToken(currentToken, xml));
    if (depth === 0 && validSiblingTypes.indexOf(currentToken[0]) !== -1) {
      list.push(currentToken);
      console.log("PUSHED!", printToken(currentToken, xml));
    }
  }
  return list;
};

export const getSiblings = (
  token: Token,
  tokens: Tokens,
  xml: string
): Tokens => {
  const siblings = [];
  const middle = tokens.indexOf(token);
  let sibling;
  let i = middle;

  console.log(token, token[0]);
  switch (token[0]) {
    case NodeTypes.ELEMENT_NODE:
      console.log("element siblings");
      return [
        ...seekGreedyBySiblings(token, tokens, true, xml),
        token,
        ...seekGreedyBySiblings(token, tokens, false, xml)
      ];
    case NodeTypes.ATTRIBUTE_NODE:
      return [
        ...seekGreedyByNodeType(token[0], token[0], i - 1, true),
        token,
        ...seekGreedyByNodeType(token[0], token[0], i + 1, false)
      ];
  }
  siblings.push(token);
  return siblings;
};
