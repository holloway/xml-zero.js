# xml-zero.js [![Build Status](https://travis-ci.org/holloway/xml-zero.js.svg?branch=master)](https://travis-ci.org/holloway/xml-zero.js)
XML / HTML parser using zero-copy techniques to allow parsing large files efficiently.

Most markup parsers convert a string of markup into a nested map of keys and values, with each of these allocated as separate variables in memory. This means that a 10MB XML file may use 100MB of memory once parsed.

A different technique would be to retain the original string and generate an index of string offsets. Because these offsets are just numbers they can be packed more efficiently ([a tutorial on zero-copy approaches](http://roxlu.com/2015/052/building-a-zero-copy-parser)).

**This software is alpha and it doesn't yet work**

## Features
* Tiny and no dependencies (2kb minified and gzipped)
* Minimal memory use for data using Zero-Copy techniques.
* Fault tolerant like HTML5 / [XML5](https://github.com/Ygg01/xml5_draft). Doesn't care about well-formedness.
* Multiple root nodes
* Valueless-attributes like HTML5 / XML5 eg &lt;input *multiple* type=file&gt;
* Attribute value *and* attribute names may be quoted (E.g. &lt;tag "some key"=false/&gt; )
* [React JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) attributes and in text (not executed of course, but they're parsed as distinct node types).
* Safer by removing [SGML cruft](https://www.owasp.org/index.php/XML_Security_Cheat_Sheet). <details>
    No support for external DTD resolution, or nested entity expansion. Only default entities in XML, NCRs, and HTML5 named entities are supported.
  </details>
* [Lots of tests](https://github.com/holloway/xml-zero.js/blob/master/src/lexer.test.js)

## Future Goals

* Editable XML (by way of making new strings and leaving the original untouched, so it's still immutable)

## Out of scope

* Complete W3C DOM (at least for now) although we will follow their API naming conventions where possible.

## Progress

- [x] Lexer
- [ ] thing that turns that into hierarchy and provides W3C DOM-like API