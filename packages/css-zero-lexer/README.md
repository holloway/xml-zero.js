# xml-zero-lexer

Friendly and forgiving CSS/SASS/LESS lexer/parser with lots of tests. Memory-efficient and Web Worker compatible.

## Features

* Supports CSS, SASS and LESS.
* Zero-copy

## Usage

This is a zero-copy lexer/parser so it returns an array of offsets.

    import Lexx, { NodeTypes } from 'css-zero-lexer';

    const css = 'text { prop; prop2: value }';
    const tokens = Lexx(xml);

    // 'tokens' is now:
    //   [
    //    [NodeTypes.SELECTOR_NODE, 0, 4],
    //    [NodeTypes.OPEN_RULE],
    //    [NodeTypes.PROPERTY_NODE, 7, 11],
    //    [NodeTypes.CLOSE_PROPERTY],
    //    [NodeTypes.PROPERTY_NODE, 13, 27],
    //    [NodeTypes.CLOSE_PROPERTY],
    //    [NodeTypes.CLOSE_RULE]
    //   ]

    css.substring(tokens[0][1], tokens[0][2]);
    // would return "text"

2.4KB gzipped.

Want to turn it back into CSS? Try `css-zero-beautify`.

---

Part of [XML-Zero.js](https://github.com/holloway/xml-zero.js)
