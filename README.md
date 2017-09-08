# xml-zero.js (alpha)
XML / HTML parser using zero-copy techniques to allow parsing large files efficiently.

Most markup parsers convert a string of markup into a nested map of keys and values, with each of these allocated as separate variables in memory. This means that a 10MB XML file may use 100MB of memory once parsed.

A different technique would be to retain the original string and parse it into string offsets. Because these are just numbers they can be packed more efficiently ([a tutorial on zero-copy approaches](http://roxlu.com/2015/052/building-a-zero-copy-parser))

* Fault tolerant. Doesn't care about well-formedness.
* Valueless-attributes like HTML5 / XML5
* Lots of tests

## Future Goals

* Editable XML (by way of making new strings and leaving the original untouched, so it's still immutable)


