import Lex, { NodeTypes } from "xml-zero-lexer";

type Token = Array<number>;

const render = [];

export default class DOM {
  constructor(xml: string, tokens: Array<Token>) {
    this.xml = xml;
    this.tokens = tokens;

    const bindAll = fn => {
      console.log("F", fn);
      this[fn.name] = fn.bind(this);
    };

    this.on = [
      // input tokens access this by index
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
    [this.documentElement, this.stringify].forEach(bindAll);
  }

  get documentElement() {
    const documentElement = this.tokens.findIndex(
      token => token[0] === NodeType.ELEMENT_NODE
    );
    return documentElement;
  }

  toString(): string {
    return this.tokens.map(token => this.fn[token[0]](token)).join("");
  }

  stringify(token: Token): string { 
    if (!token || (token.length - 1) % 2 !== 0)
      throw Error(`Invalid token length: ${token.length}. ${token}`);
  return [
    NodeTypeKeys[token[0]],
    ...Array.apply(null, Array((token.length - 1) / 2)).map((w, pairIndex) => {
      const i = 1 + pairIndex * 2;
      return xml.substring(token[i], token[i + 1]);
    })
  ];
  }

  onXMLDeclaration(token: Token) {
    return this.stringify(token);
  },
  onElementNode(token: Token) {},
  onAttributeNode(token: Token) {},
  onTextNode(token: Token) {},
  onCDATASectionNode(token: Token) {},
  onEntityReferenceNode(token: Token) {},
  onEntityNode(token: Token) {},
  onProcessingInstructionNode(token: Token) {},
  onCommentNode(token: Token) {},
  onDocumentNode(token: Token) {},
  onDocumentTypeNode(token: Token) {},
  onDocumentFragmentNode(token: Token) {},
  onNotationNode(token: Token) {},
  onCloseElement(token: Token) {},
  onJSXAttribute(token: Token) {},
  onJSX(token: Token) {}
}
