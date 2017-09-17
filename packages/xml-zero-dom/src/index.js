import Lexx, { NodeTypes, NodeTypeKeys } from "xml-zero-lexer";
import XMLZeroElement from "./element";
import { seekByNodeType } from "./utils";
import type { Token, Tokens } from "./types";

export default class XMLZeroDOM {
  // I was think about extending XMLZeroElement but that
  // should have a distinct open/close element pair whereas
  // this doesn't (it can have multiple root nodes) so it felt
  // easier to just have a DOM class
  constructor(xml: string) {
    this.xml = xml;
    this.tokens = Lexx(xml);

    const bindAll = fn => {
      this[fn.name] = fn.bind(this);
    };
  }

  get documentElement() {
    const token = seekByNodeType(this.tokens, NodeTypes.ELEMENT_NODE);
    if (!token._element) {
      token._element = new XMLZeroElement(this.xml, this.tokens, token);
    }
    return token._element;
  }
}
