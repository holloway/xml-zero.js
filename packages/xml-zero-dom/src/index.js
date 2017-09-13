import Lexx, { NodeTypes, NodeTypeKeys } from "xml-zero-lexer";

console.log("NodeTypeKeys", NodeTypeKeys);

type Token = Array<number>;

export default class DOM {
  constructor(xml: string, tokens: Array<Token>) {
    this.xml = xml;
    this.tokens = tokens || Lexx(xml);

    const bindAll = fn => {
      console.log("*", fn, fn.bind);
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
    [this.stringify, this.toString].forEach(bindAll);
  }

  get documentElement() {
    console.log("do CELEMENT!");
    const i = this.tokens.findIndex(
      token => token[0] === NodeTypes.ELEMENT_NODE
    );
    return this.stringify(this.tokens[i]);
  }

  toString(): string {
    return this.tokens.map(token => this.fn[token[0]](token)).join("");
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
