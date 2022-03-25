# xml-zero-lexer

Friendly and forgiving HTML5/XML5/React-JSX lexer/parser with lots of tests. Memory-efficient and Web Worker compatible.

Parses an input `string` of HTML/XML/React-JSX into tokens of `[NODE_TYPE, START_INDEX, END_INDEX, ...REST]` so that you can filter on `NODE_TYPE` or `.substring(start, end)` into the input string to select what you want.

## Features

- HTML, XML, and React JSX parsing/lexing
- Zero-copy (returns only indexes into the original string, not copies of values)
- TypeScript
- Lots of tests
- Limited in scope. Easy to audit
- Zero dependencies

## "Zero Copy"?

The term has many definitions, but basically the approach is to parse an input and return a 'table of contents' data structure allowing you —the programmer— to select back into the input to retrieve what you want based on the 'table of contents'.

The term "Zero Copy" is an attempt to distinguish between _'table of contents'_ parsing Vs a _'fork the data, and copy every part into a new data structure without any reference to the original'_ approach to parsing.

This is all quite philosophical so unless you really care about this then choose a more popular library, please.

`xml-zero-lexer` parses input strings of HTML, XML, and React JSX – returning **an array** of `[NodeType: NODE_TYPE, ...restIndexes: number[] (integer index into input string) ]`.

- `NODE_TYPE: number` can be `NodeTypes.OPEN_ELEMENT` or `NodeTypes.CLOSE_ELEMENT` or `NodeTypes.TEXT_NODE` or `NodeTypes.ATTRIBUTE_NODE` (etc...). This constant can be accessed through the `NodeTypes` export eg `import { NodeTypes } from 'xml-zero-lexer';`.
- `restIndexes: number[]` an array of indexes into the input string that can be used as eg. `inputString.substring(restIndexes[0], restIndexes[1])`.

## Usage

```typescript
import Lexx, { NodeTypes } from "xml-zero-lexer";

const xml = "<p>his divine shadow</p>";

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

// The first token is an element so this is true:
const isElement = firstToken[0] === NodeTypes.ELEMENT_NODE;

// this would log a string of "p"
console.log(xml.substring(firstToken[1], firstToken[2]));

const secondToken = tokens[1];

// The second token is a text node so this is true;
const isTextNode = secondToken[0] === NodeTypes.TEXT_NODE;

// would return "his divine shadow"
console.log(xml.substring(secondToken[1], secondToken[2]));
```

5KB gzipped.

Want to turn it back into formatted HTML or XML? Try `xml-zero-beautify`.

---

Part of [XML-Zero.js](https://github.com/holloway/xml-zero.js)
