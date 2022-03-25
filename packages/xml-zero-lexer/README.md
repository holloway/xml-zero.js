# xml-zero-lexer

Friendly and forgiving HTML5/XML5/React-JSX lexer/parser with lots of tests. Memory-efficient and Web Worker compatible.

## Features

- HTML, XML, and React JSX parsing/lexing
- Zero-copy (returns only indexes into the original string, not copies of values)
- TypeScript
- Lots of tests
- Limited in scope. Easy to audit
- Zero dependencies

## "Zero Copy"?

Generally speaking (_very_ generally) the term 'zero copy' refers to a way of parsing input and returning a 'table of contents' data structure providing to you —the programmer— a list of indexes into the input.

The term "Zero Copy" is an attempt to distinguish between _'table of contents'_ parsing **Vs** a _'fork the input data, and copy every distinct part into a new data structure without any reference to the original'_ approach to parsing.

This is all quite philosophical so unless you really care about this then choose a more popular library, please.

## Usage

```typescript
import Lexx, { NodeTypes } from "xml-zero-lexer";
//
const xml = "<p>his divine shadow</p>";
//
const tokens = Lexx(xml);
//
// So now 'tokens' will be:
//
//   [
//     [NodeTypes.ELEMENT_NODE, 1, 2],
//     [NodeTypes.TEXT_NODE, 3, 20],
//     [NodeTypes.CLOSE_ELEMENT],
//   ]
//
// You can now index into the input string
// using the return value `tokens`...
//
const firstToken = tokens[0];
//
// The first token is an element so this is true:
const isElement = firstToken[0] === NodeTypes.ELEMENT_NODE;
//
// would console.log a string of "p"
console.log(xml.substring(firstToken[1], firstToken[2]));
//
const secondToken = tokens[1];
//
// The second token is a text node so this is true;
const isTextNode = secondToken[0] === NodeTypes.TEXT_NODE;
//
// would console.log a string of "his divine shadow"
console.log(xml.substring(secondToken[1], secondToken[2]));
```

## API

`xml-zero-lexer`'s default export is a function that can be imported as `import Lexx from 'xml-zero-lexer';`.

You can provide this function one or two arguments:

1. _(Required)_ The input `string` of HTML, XML, or React JSX;
2. _(Optional)_ `{ jsx?: boolean; html?: boolean; blackholes?: string[] }` where:
   **jsx** (boolean, optional, default=false): React-JSX attributes are always parsed by `xml-zero-lexer` so this option is only whether to parse `{expression}` in the middle of text / child nodes as a distinct token.
   **html** (boolean, optional, default=false): Currently, only affects whether to treat `<br>` and `<link>` and `<img>` (and other HTML self-closing tags) as self-closing tags, affecting whether to return another token of `[NodeTypes.CLOSE_ELEMENT]`.
   **blackholes** (string[], optional, default=["script", "style"]): an array of elements names (typically `["script", "style"]` etc.) that have special parsing rules meaning input of `<script> <p> </script>` should be parsed as a script element with a text node of `" <p> "`. The special rule is that such an element encompasses everything until it closes with the same element name.

This function returns **an array of Tokens** `[NodeType: NODE_TYPE, ...restIndexes: number[] ][]` where:

- `NodeType: NODE_TYPE (number, integer)` can be `NodeTypes.OPEN_ELEMENT`, `NodeTypes.CLOSE_ELEMENT`, `NodeTypes.TEXT_NODE`, `NodeTypes.ATTRIBUTE_NODE` (etc...). This constant can be accessed through the `NodeTypes` export eg `import { NodeTypes } from 'xml-zero-lexer';` and there are TS types.
- `...restIndexes: number[]` an array of integer indexes into the input string that can be used as eg. `inputString.substring(restIndexes[0], restIndexes[1])`. The length of this array varies based on the `NodeType`. Some `NodeType`s also have a variable length, such as `NodeTypes.ATTRIBUTE`, which can have a value or be "valueless" in HTML (ie `<input hidden>` lacks a value, and in HTML5 should be treated as a boolean `true`). To give an example an input of `<a href="//zombo.com" hidden>` would return:

```typescript
[
  [NodeTypes.ELEMENT_NODE, 1, 2],
  [NodeTypes.ATTRIBUTE_NODE, 3, 7, 9, 20],
  [NodeTypes.ATTRIBUTE_NODE, 22, 28],
];
```

Note the variation in length of the `ATTRIBUTE_NODE` tokens.

To learn more about the expected outputs for various inputs, please read the tests in [`index.test.ts`](https://github.com/holloway/xml-zero.js/blob/master/packages/xml-zero-lexer/src/index.test.ts#L41)... they're designed to be readable, just look for the `const cases = [` variable around line 41.

4KB gzipped.

Want to turn it back into formatted HTML or XML? Try `xml-zero-beautify`.

## CHANGELOG

If you're upgrading to 3.1.x or greater please note that parsing `</>` no longer results in an array with two items of an opening element and a closing element, it now just results in an array with one item of a closing element. This better adheres to expected semantics for React-JSX parsing. Tests have been updated accordingly.

---

Part of [XML-Zero.js](https://github.com/holloway/xml-zero.js)

```

```
