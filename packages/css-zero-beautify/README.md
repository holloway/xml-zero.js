# css-zero-beautify

Friendly and forgiving CSS/SASS/LESS beautifier with lots of tests. Memory-efficient and Web Worker compatible.

This is a work in progress. Don't use it yet!

## Features

* Supports CSS/SASS/LESS.
* Zero-copy

## Usage

    import Beautify, { OUTPUT_FORMATS } from 'css-zero-beautifier';
    const css = 'text selector1, text selector2 { prop; prop2 { value } /* comment */ }';

    let result = Beautify(css);
    // result is,
    //
    // text selector1,
    // text selector2 {
    //   prop;
    //   prop2 {
    //     value;
    //   }
    //   /* comment */
    // }

    result = Beautify(css, { output: OUTPUT_FORMATS.html });
    // result is,
    //
    // <span class="b-selector">text selector1</span><span class="b-comma">,</span><br/>
    // <span class="b-selector">text selector2</span> <span class="b-open-rule">{</span><br/>
    //  &nbsp;<span class="b-prop">prop</span><span class="b-prop-close">;</span><br/>
    //  &nbsp;<span class="b-selector">prop2</span> <span class="b-open-rule">{</span><br/>
    //  &nbsp; &nbsp;<span class="b-prop">value</span><span class="b-prop-close">;</span><br/>
    //  &nbsp;<span class="b-close-rule">}</span><br/>
    //  &nbsp;<span class="b-comment">/* comment */</span><br/>
    // <span class="b-close-rule">}</span><br/>

8KB gzipped (that includes all deps).

Just want a lexer? Try `css-zero-lexer`.

---

Part of [XML-Zero.js](https://github.com/holloway/xml-zero.js)
