# xml-zero.js

HTML / XML parser using zero-copy techniques to allow parsing large files efficiently.

Most markup parsers convert a string of markup into a nested map of keys and values, with each of these allocated as separate variables in memory. This means that a 10MB XML file may use 100MB of memory once parsed.

A different technique would be to retain the original string and generate an index of string offsets. Because these offsets are just numbers they can be packed more efficiently ([a tutorial on zero-copy approaches](http://roxlu.com/2015/052/building-a-zero-copy-parser)).

**This software is alpha and it doesn't yet work**

## Features
* Tiny and no dependencies (2.6kb minified and gzipped)
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

## Out of scope

* Complete W3C DOM (at least for now) although we will follow their API naming conventions where possible.
* HTML5 implied tags (e.g. `xml-zero.js` won't automatically create tags such as &lt;html&gt;, &lt;head&gt;, &lt;tbody&gt;, [...etc](https://www.w3.org/TR/html5/syntax.html#syntax-tag-omission)).

## Progress

- [x] Lexer (2.6KB minified and gzipped)
- [ ] A W3C DOM-like API
- [ ] Editable XML (by way of making new strings and leaving the original untouched, so it's still immutable)

## References

* [XML5](https://github.com/Ygg01/xml5_draft)
* [MicroXML](https://www.w3.org/community/microxml/) ([JClark](http://blog.jclark.com/2010/12/microxml.html), [Intro Presentation](http://archive.xmlprague.cz/2013/presentations/Introducing_MicroXML.pdf)) 
* [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/)
