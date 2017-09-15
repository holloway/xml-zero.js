# xml-zero.js

Friendly and forgiving HTML5/XML5 lexer with support for React JSX and using zero-copy techniques to allow parsing large files efficiently.

Most markup parsers convert a string of markup into a nested map(hash/dict) of keys and values, with each of these allocated as separate variables in memory. This means that a 10MB XML file may balloon to 100MB of memory once parsed.

A different technique would be to retain the original string and generate an index of string offsets. Because these offsets are just numbers they can be packed more efficiently ([a tutorial on zero-copy approaches](http://roxlu.com/2015/052/building-a-zero-copy-parser)).

**This software is alpha and it doesn't yet work**

## Features
* Fault tolerant like HTML5/[XML5](https://github.com/Ygg01/xml5_draft). Doesn't care about well-formedness.
 * Valueless-attributes like HTML5 / XML5 eg &lt;input *multiple* type=file&gt;
 * Attribute value *and* attribute names may be quoted (E.g. &lt;tag "some key"=false/&gt; )
 * [React JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) attributes and in text (not executed of course, but they're parsed as distinct node types).
 * Multiple root nodes. <abbr title="garbage in, garbage out">GIGO</abbr>.
* Minimal memory use for data using Zero-Copy techniques.
* Tiny, no dependencies, and can run in Web Workers (e.g. doesn't use DOM APIs).
* Safer by removing [SGML cruft](https://www.owasp.org/index.php/XML_Security_Cheat_Sheet). <details>
    No support for external DTD resolution, or nested entity expansion. Only default entities in XML, NCRs, and HTML5 named entities are supported.
  </details>
* [Lots of tests](https://github.com/holloway/xml-zero.js/blob/master/packages/xml-zero-lexer/test/index.test.js).

## Out of scope

* Complete W3C DOM (at least for now) although we will follow their API naming conventions where possible.
* HTML5 implied tags (e.g. won't automatically create tags such as &lt;html&gt;, &lt;head&gt;, &lt;tbody&gt;, [...etc](https://www.w3.org/TR/html5/syntax.html#syntax-tag-omission)).

## Install

    npm install xml-zero-lexer

(more packages to come, but i'm making it modular)

## Progress

- [x] [Lexer](https://www.npmjs.com/package/xml-zero-lexer) (2.6KB minified and gzipped)
- [ ] A W3C DOM-like API
- [ ] Editable XML (by way of making new strings and leaving the original untouched, so it's still immutable)

## References

* [XML5](https://github.com/Ygg01/xml5_draft)
* [MicroXML](https://www.w3.org/community/microxml/) ([JClark](http://blog.jclark.com/2010/12/microxml.html), [Intro Presentation](http://archive.xmlprague.cz/2013/presentations/Introducing_MicroXML.pdf)) 
* [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/)
