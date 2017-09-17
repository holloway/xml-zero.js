import { NodeTypes } from "xml-zero-lexer";
import type { Token, Tokens } from "./types";

export default class XMLZeroElement {
  constructor(
    xml: string,
    tokens: Array<Token>,
    startToken: ?Token,
    endToken: ?Token
  ) {
    this.xml = xml;
    this.tokens = tokens;
    this.token = startToken || this.tokens[0];
    this._endToken = endToken;

    const bindAll = fn => {
      // console.log("fn", fn);
      this[fn.name] = fn.bind(this);
    };

    this.on = [
      // input tokens access this array by index
      // so don't add other functions here
      this.onXMLDeclaration,
      this.onElementNode,
      this.onAttributeNode,
      this.onTextNode,
      this.onCDATASectionNode,
      this.onEntityReferenceNode,
      this.onEntityNode,
      this.onProcessingInstructionNode,
      this.onCommentNode,
      this.onDocumentNode,
      this.onDocumentTypeNode,
      this.onDocumentFragmentNode,
      this.onNotationNode,
      this.onCloseElement,
      this.onJSXAttribute,
      this.onJSX
    ];
    this.on.forEach(bindAll);

    [this.stringify, this.toString, this.getAttribute].forEach(bindAll);
  }

  toString(): string {
    const index = this.tokens.indexOf(this.token);
    const endIndex = this.tokens.indexOf(this.endToken);
    return this.tokens
      .slice(index, endIndex)
      .map(token => this.fn[token[0]](token))
      .join("");
  }

  get name(): string {
    if (!this.token._name) {
      this.token._name = this.xml.substring(this.token[1], this.token[2]);
    }
    return this.token._name;
  }

  getAttribute(name: string): ?string {
    let i = this.tokens.indexOf(this.token);
    console.log("i", i);
    if (i === -1) return;
    let token;
    while (i++) {
      token = this.tokens[i];
      if (token[0] !== NodeTypes.ATTRIBUTE_NODE) return; // we didn't
      if (token[2] - token[1] === name.length) {
        // don't bother if the name is a different length
        if (token._name === undefined) {
          token._name = this.xml.substring(token[1], token[2]);
        }
        if (token._name === name) {
          if (token.length === 3) {
            // valueless, so return boolean
            return true;
          }
          if (token._value === undefined) {
            token._value = this.xml.substring(token[3], token[4]);
          }
          return token._value;
        }
      }
    }
  }

  get endToken() {
    return this.xml.substring(token[i], token[i + 1]);
  }

  stringify(token: Token): string {
    if (!token || (token.length - 1) % 2 !== 0)
      throw Error(`Invalid token length: ${token.length}. ${token}`);

    console.log("stringify", token, this.xml);

    return [
      NodeTypeKeys[token[0]],
      ...Array.apply(
        null,
        Array((token.length - 1) / 2)
      ).map((w, pairIndex) => {
        const i = 1 + pairIndex * 2;
        return this.xml.substring(token[i], token[i + 1]);
      })
    ];
  }

  onXMLDeclaration(token: Token) {
    return this.stringify(token);
  }
  onElementNode(token: Token) {
    return this.stringify(token);
  }
  onAttributeNode(token: Token) {
    return this.stringify(token);
  }
  onTextNode(token: Token) {
    return this.stringify(token);
  }
  onCDATASectionNode(token: Token) {
    return this.stringify(token);
  }
  onEntityReferenceNode(token: Token) {
    return this.stringify(token);
  }
  onEntityNode(token: Token) {
    return this.stringify(token);
  }
  onProcessingInstructionNode(token: Token) {
    return this.stringify(token);
  }
  onCommentNode(token: Token) {
    return this.stringify(token);
  }
  onDocumentNode(token: Token) {
    return this.stringify(token);
  }
  onDocumentTypeNode(token: Token) {
    return this.stringify(token);
  }
  onDocumentFragmentNode(token: Token) {
    return this.stringify(token);
  }
  onNotationNode(token: Token) {
    return this.stringify(token);
  }
  onCloseElement(token: Token) {
    return this.stringify(token);
  }
  onJSXAttribute(token: Token) {
    return this.stringify(token);
  }
  onJSX(token: Token) {
    return this.stringify(token);
  }
}
