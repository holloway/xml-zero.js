import type { Token, Tokens } from "./types";

export const seekByNodeType = (
  tokens: Tokens,
  nodeType: number,
  startAtIndex: ?number
): Token => {
  const i = seekIndexByNodeType(tokens, nodeType, startAtIndex);
  if (i === -1) return undefined;
  return tokens[i];
};

export const seekIndexByNodeType = (
  tokens: Tokens,
  nodeType: number,
  startAtIndex: ?number
): number =>
  startAtIndex === undefined
    ? tokens.findIndex(token => token[0] === nodeType)
    : tokens.indexOf(tokens.find(token => token[0] === nodeType));
