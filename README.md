# xml-zero.js

Friendly and forgiving HTML5/XML5 parser that supports React JSX, and uses zero-copy techniques to allow parsing large files efficiently.

Most markup parsers convert a string of markup into a nested map(hash/dict) of keys and values, with each of these allocated as separate variables in memory. This means that a 10MB XML file may balloon to 100MB of memory.

A different technique would be to retain the original string and generate an index of string offsets. Because these offsets are just numbers they can be packed more efficiently ([a tutorial on zero-copy approaches](http://roxlu.com/2015/052/building-a-zero-copy-parser)).

**This software is beta and it doesn't yet work**

## Features
* Fault tolerant like HTML5/[XML5](https://github.com/Ygg01/xml5_draft).
  * Valueless-attributes like HTML5 / XML5 eg &lt;input *multiple* type=file&gt;
  * Attribute values may be quoted (E.g. &lt;tag "some key"=false/&gt; ) or not
  * [React JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) attributes and in text (not executed of course, but they're parsed as distinct node types).
  * Multiple root nodes. Doesn't care about well-formedness. <abbr title="garbage in ➜ garbage out">GIGO</abbr>.
* Minimising memory use through Zero-Copy techniques.
* Tiny, no dependencies, and can run in Web Workers (e.g. doesn't use DOM APIs).
* Safer by removing [SGML cruft](https://www.owasp.org/index.php/XML_Security_Cheat_Sheet). <details>
    No support for external DTD resolution, or nested entity expansion. Only default entities in XML, NCRs, and HTML5 named entities are supported.
  </details>
* [Lots of tests](https://github.com/holloway/xml-zero.js/blob/master/packages/xml-zero-lexer/test/index.test.js).

## Out of scope

* Complete W3C DOM (at least for now) although we will follow their API naming conventions where reasonable.
* HTML5 implied tags (e.g. won't automatically create tags such as &lt;html&gt;, &lt;head&gt;, &lt;tbody&gt;, [...etc](https://www.w3.org/TR/html5/syntax.html#syntax-tag-omission)).

## Install

    npm install xml-zero-lexer
    
    npm install xml-zero-beautify
    
    npm install whats-the-damage

(more packages to come, but i'm making it modular)

## Progress

- [x] [Lexer](https://www.npmjs.com/package/xml-zero-lexer) (2.6KB no dependencies, minified and gzipped)
- [x] [Beautifier](https://www.npmjs.com/package/xml-zero-beautify) (4KB all dependencies, minified and gzipped)
- [X] [What's The Damage](https://www.npmjs.com/package/whats-the-damage) benchmarker that measures time/memory/CPU of scripts
- [ ] A W3C DOM-like API
- [ ] Editable XML (by way of making new strings and leaving the original untouched, so it's still immutable)

## References

* [XML5](https://github.com/Ygg01/xml5_draft)
* [MicroXML](https://www.w3.org/community/microxml/) ([JClark](http://blog.jclark.com/2010/12/microxml.html), [Intro Presentation](http://archive.xmlprague.cz/2013/presentations/Introducing_MicroXML.pdf)) 
* [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/)
