# xml-zero-beautify

Friendly and forgiving HTML5/XML5/JSX beautifier with lots of tests. Memory-efficient and Web Worker compatible.

## Features

* Supports HTML, XML, and JSX.
* Zero-copy

## Usage

    import Beautify, { OUTPUT_FORMATS } from 'xml-zero-beautifier';

    const plaintext = Beautify('<p>shadows</p>');
    // result is,
    // <p>
    //   shadows
    // </p>

    const html = Beautify('<p>shadows</p>', { output: OUTPUT_FORMATS.html });
    // result is,
    // <span class="b-tag">&lt;p&gt;</span><br/>
    //  &nbsp;<span class="b-text">shadows</span><br/>
    // <span class="b-tag">&lt;/p&gt;</span><br/>

    So you can style those classes.

    The "b-" prefix is configurable, just pass `outputHtmlClassPrefix: "conflict-free-",

8KB gzipped (that includes all deps).

Just want a lexer? Try `xml-zero-lexer`.

---

Part of [XML-Zero.js](https://github.com/holloway/xml-zero.js)
