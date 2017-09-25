import Lexx, { NodeTypes, NodeTypeKeys } from "xml-zero-lexer";
import XMLZeroElement from "./element";
import { seekByNodeType, getSiblings } from "./utils";
import type { Token, Tokens } from "./types";

export default class XMLZeroDOM {
  // I was think about extending XMLZeroElement but that
  // should have a distinct open/close element pair whereas
  // this doesn't (it can have multiple root nodes) so it felt
  // easier to just have a DOM class
  constructor(xml: string) {
    this.xml = xml;
    this.tokens = Lexx(xml);
    this.cache = {}; // use a weakmap?

    const bindAll = fn => {
      this[fn.name] = fn.bind(this);
    };
  }

  get documentElementToken() {
    this.cache.documentElementToken =
      this.cache.documentElementToken ||
      seekByNodeType(NodeTypes.ELEMENT_NODE, this.tokens);
    // maybe i should store the index of the token so that,
    // rather than erasing all cache, I can just invalidate
    // caches of tokens further along this.tokens.
    return this.cache.documentElementToken;
  }

  get documentElement() {
    this.documentElementToken._element =
      this.documentElementToken._element ||
      new XMLZeroElement(this.xml, this.tokens, this.documentElementToken);

    return this.documentElementToken._element;
  }

  get documentElements() {
    console.log("dEs");
    this.cache.documentElements =
      this.cache.documentElements ||
      getSiblings(this.documentElementToken, this.tokens, this.xml);
    console.log("dEs after");
    return this.cache.documentElements;
  }
}
