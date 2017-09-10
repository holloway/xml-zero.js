# xml-zero.js [![Build Status](https://travis-ci.org/holloway/xml-zero.js.svg?branch=master)](https://travis-ci.org/holloway/xml-zero.js)
XML / HTML parser using zero-copy techniques to allow parsing large files efficiently.

Most markup parsers convert a string of markup into a nested map of keys and values, with each of these allocated as separate variables in memory. This means that a 10MB XML file may use 100MB of memory once parsed.

A different technique would be to retain the original string and generate an index of string offsets. Because these offsets are just numbers they can be packed more efficiently ([a tutorial on zero-copy approaches](http://roxlu.com/2015/052/building-a-zero-copy-parser)).

**This software is alpha and it doesn't yet work**

## Features
* Fault tolerant like HTML5 / [XML5](https://github.com/Ygg01/xml5_draft). Doesn't care about well-formedness.
* Tiny memory use
* Valueless-attributes like HTML5 / XML5
* Attributes and values may be quoted (E.g. you could have a valueless attribute of &lt;input "multiple files"&gt; )
* Tiny and no dependencies
* [Lots of tests](https://github.com/holloway/xml-zero.js/blob/master/src/lexer.test.js)

## Future Goals

* Editable XML (by way of making new strings and leaving the original untouched, so it's still immutable)

## Out of scope

* W3C DOM (at least for now)

## Progress

[X] Lexer