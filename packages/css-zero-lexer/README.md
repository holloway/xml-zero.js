# xml-zero-lexer

Friendly and forgiving HTML5/XML5/JSX lexer/parser with lots of tests. Memory-efficient and Web Worker compatible.

Parses HTML/XML/React JSX into tokens.

## Features

* Supports HTML, XML, and JSX.
* Zero-copy

## Usage

This is a zero-copy lexer/parser so it returns an array of offsets.

    import Lexx, { NodeTypes } from 'xml-zero-lexer';

    const xml = '<p>his divine shadow</p>';
    const tokens = Lexx(xml);

    // 'tokens' is now:
    //   [
    //     [NodeTypes.ELEMENT_NODE, 1, 2],
    //     [NodeTypes.TEXT_NODE, 3, 20],
    //     [NodeTypes.CLOSE_ELEMENT],
    //   ]

    xml.substring(tokens[0][0], tokens[0][1]);
    // would return "p"

    xml.substring(tokens[1][0], tokens[1][1]);
    // would return "his divine shadow"

5KB gzipped.

Want to turn it back into HTML? Try `xml-zero-beautify`.

---

Part of [XML-Zero.js](https://github.com/holloway/xml-zero.js)
