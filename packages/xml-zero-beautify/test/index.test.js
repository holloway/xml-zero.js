import Beautify, { OUTPUT_FORMATS } from "../src/index";

var cases = [
  {
    desc: "Single element",
    xml: "<x>test</x>",
    jsx: false,
    beautified: "<x>\n  test\n</x>\n"
  },
  {
    desc: "Single unclosed element",
    xml: "<x>test",
    jsx: false,
    beautified: "<x>\n  test\n"
  },
  {
    desc: "Two elements",
    xml: "<x><l>test</l></x>",
    jsx: false,
    beautified: "<x>\n  <l>\n    test\n  </l>\n</x>\n"
  },
  {
    desc: "Two elements with JSX but JSX is disabled",
    xml: "<x><l>test {var}</l></x>",
    jsx: false,
    beautified: "<x>\n  <l>\n    test {var}\n  </l>\n</x>\n"
  },
  {
    desc: "Two elements with JSX but JSX is enabled",
    xml: "<x><l>test {var}</l></x>",
    jsx: true,
    beautified: "<x>\n  <l>\n    test\n    {var}\n  </l>\n</x>\n"
  },
  {
    desc: "text",
    xml: "text",
    jsx: true,
    beautified: "text\n"
  },
  {
    desc:
      "a tag with no name which we will consider to be not self-closing. surrounded by text",
    xml: "text<>test",
    beautified: "text\n<>\n  test\n"
  },
  {
    desc:
      "text followed by an element that's self-closing element without a name </> ...actually indistinguishable from a closing tag without a name </> but we'll treat it as an element that's self-closing (with distinct .length === 1 so you can tell these apart... and if you want to ignore the open and just consider it a close you can ignore it)",
    xml: "text</>",
    beautified: "text\n</>\n"
  },
  {
    desc: "the tag has no name self-closing followed by text",
    xml: "text</>text",
    beautified: "text\n</>\ntext\n"
  },
  {
    desc: "the tag has no name self-closing followed by text",
    xml: "text< />text",
    beautified: "text\n</>\ntext\n"
  },
  {
    desc: "the tag has no name self-closing followed by text",
    xml: "text< attr/>text",
    beautified: "text\n< attr/>\ntext\n"
  },
  {
    desc:
      "the tag has no name and has an attribute with a slash and space at the end. the slash is removed to be consistant with parsing of < attr/> but we don't consider it a self-closing element. If you want slashes use quotemarks",
    xml: "text< attr/ >text",
    beautified: "text\n< attr>\n  text\n"
  },
  {
    desc:
      "fish tags. note that </> is parsed as an open AND close with .length===1 so you can filter it",
    xml: "<></>",
    beautified: "<>\n</>\n"
  },
  {
    desc:
      "the tag has no name and has an attribute with a slash and space at the end. the slash is removed to be consistant with parsing of < attr/> but we don't consider it a self-closing element. If you want slashes use quotemarks",
    xml: "text< doc></doc>text",
    beautified: "text\n< doc/>\ntext\n"
  },
  {
    desc: "declaration",
    xml: "<?xml?>",
    beautified: "<?xml?>\n"
  },
  {
    desc: "declaration with space",
    xml: "<?xml ?>",
    beautified: "<?xml?>\n"
  },
  {
    desc: "declaration with non-wellformed closing",
    xml: "<?xml>",
    beautified: "<?xml?>\n"
  },
  {
    desc: "processing instruction",
    xml: "<?xml-?>",
    beautified: "<?xml-?>\n"
  },
  {
    desc: "processing instruction",
    xml: "<?xml->",
    beautified: "<?xml-?>\n"
  },
  {
    desc: "declaration with attributes",
    xml: '<?xml version="1.0"?>',
    beautified: '<?xml version="1.0"?>\n'
  },
  {
    desc: "declaration with attribute following whitespace",
    xml: '<?xml version="1.0" ?>',
    beautified: '<?xml version="1.0"?>\n'
  },
  {
    desc: "declaration with attribute single quotes",
    xml: "<?xml version='1.0'?>",
    beautified: '<?xml version="1.0"?>\n'
  },
  {
    desc: "declaration with attribute single quotes value has a > in it",
    xml: "<doc attr='2>1'/>",
    beautified: '<doc attr="2>1"/>\n'
  },
  {
    desc: "declaration with two attributes",
    xml: "<?xml version='1.0' lang=\"en\"    ?>",
    beautified: '<?xml version="1.0" lang="en"?>\n'
  },
  {
    desc: "declaration with two attributes close together",
    xml: "<?xml version='1.0'lang=\"en\"     ?>",
    beautified: '<?xml version="1.0" lang="en"?>\n'
  },
  {
    desc: "Processing instruction with attribute",
    xml: '<?xml-stylesheet href="1.0"?>',
    beautified: '<?xml-stylesheet href="1.0"?>\n'
  },
  {
    desc: "Processing instruction with valueless attribute",
    xml: "<?xml-stylesheet href?>",
    beautified: "<?xml-stylesheet href?>\n"
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute",
    xml: "<?xml-stylesheet href yahoo='serious'?>",
    beautified: '<?xml-stylesheet href yahoo="serious"?>\n'
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks",
    xml: "<?xml-stylesheet href yahoo=serious?>",
    beautified: '<?xml-stylesheet href yahoo="serious"?>\n'
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing",
    xml: "<?xml-stylesheet href yahoo=serious>",
    beautified: '<?xml-stylesheet href yahoo="serious"?>\n'
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name",
    xml: "<?xml-stylesheet href yahoo=serious x>",
    beautified: '<?xml-stylesheet href yahoo="serious" x?>\n'
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name",
    xml: "<?xml-stylesheet href xx>",
    beautified: "<?xml-stylesheet href xx?>\n"
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name and a space",
    xml: "<?xml-stylesheet href xx >",
    beautified: "<?xml-stylesheet href xx?>\n"
  },
  {
    desc: "declaration and self-closing element",
    xml: "<?xml?><a/>",
    beautified: "<?xml?>\n<a/>\n"
  },
  {
    desc: "declaration and element",
    xml: "<?xml?><a>",
    beautified: "<?xml?>\n<a>\n"
  },
  {
    desc: "declaration and two elements",
    xml: "<?xml?><a><b>",
    beautified: "<?xml?>\n<a>\n  <b>\n"
  },
  {
    desc: "declaration and two elements (one self-closing)",
    xml: "<?xml?><a/><b>",
    beautified: "<?xml?>\n<a/>\n<b>\n"
  },
  {
    desc: "declaration and two elements (one closing)",
    xml: "<?xml?><a></a><b>",
    beautified: "<?xml?>\n<a/>\n<b>\n"
  },
  {
    desc: "declaration and two elements (one self-closing)",
    xml: "<?xml?><a></a><b/>",
    beautified: "<?xml?>\n<a/>\n<b/>\n"
  },
  {
    desc: "element followed by text",
    xml: "<a> text",
    beautified: "<a>\n  text\n"
  },
  {
    desc: "element surrounded by text",
    xml: "a<a>text",
    beautified: "a\n<a>\n  text\n"
  },
  {
    desc: "comment",
    xml: "<!-- test -->",
    beautified: "<!-- test -->\n"
  },
  {
    desc: "comment with text before",
    xml: "a<!-- test -->",
    beautified: "a\n<!-- test -->\n"
  },
  {
    desc: "comment with text before and after",
    xml: "a<!-- test -->b",
    beautified: "a\n<!-- test -->\nb\n"
  },
  {
    desc: "self-closing element",
    xml: "<a/>",
    beautified: "<a/>\n"
  },
  {
    desc: "non-self-closing element",
    xml: "<a>",
    beautified: "<a>\n"
  },
  {
    desc: "nested elements",
    xml: "<a><b/></a>",
    beautified: "<a>\n  <b/>\n</a>\n"
  },
  {
    desc: "declaration and elements",
    xml: "<?xml?><a><b/></a>",
    beautified: "<?xml?>\n<a>\n  <b/>\n</a>\n"
  },
  {
    desc: "declaration and elements with attributes",
    xml: "<?xml?><a href='http://html5zombo.com'><b/></a>",
    beautified: '<?xml?>\n<a href="http://html5zombo.com">\n  <b/>\n</a>\n'
  },
  {
    desc: "declaration with weird self-closing",
    xml: "<?xml/>",
    beautified: "<?xml?>\n"
  },
  {
    desc: "Doctype",
    xml: `<!DOCTYPE html PUBLIC
    "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`,
    beautified:
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n'
  },
  {
    desc: "Doctype followed by text",
    xml: `<!DOCTYPE html PUBLIC
    "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">ab`,
    beautified:
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\nab\n'
  },
  {
    desc: "HTML5 followed by html root tag",
    xml: `<!DOCTYPE html><html>`,
    beautified: `<!DOCTYPE html>\n<html>\n`
  },
  {
    desc: "CDATA Section",
    xml: `<![CDATA[ \t <foo></bar> \t ]]>`,
    beautified: "<![CDATA[ \t <foo></bar> \t ]]>\n"
  },
  {
    desc: "CDATA Section followed by text",
    xml: `<![CDATA[ \t <foo></bar> \t ]]>abc`,
    beautified: "<![CDATA[ \t <foo></bar> \t ]]>\nabc\n"
  },
  {
    desc: "Entity",
    xml: `<!ENTITY entityname "replacement">`,
    beautified: "<!ENTITY entityname replacement>\n"
  },
  {
    desc: "Entity",
    xml: `<!ENTITY entityname "replacement text">`,
    beautified: '<!ENTITY entityname "replacement text">\n'
  },
  {
    desc: "Entity",
    xml: `<!ENTITY entityname "replacement text" third-thing>`,
    beautified: '<!ENTITY entityname "replacement text" "third-thing">\n'
  },
  {
    desc: "Entity followed by text",
    xml: `<!ENTITY entityname "replacement text">a`,
    beautified: '<!ENTITY entityname "replacement text">\na\n'
  },
  // { // difficult and obscure xml feature. probably not necessary to handle this but PRs welcome!
  //   desc:
  //     "Doctype with entity definitions, followed by element with an entity in text node",
  //   xml: `<!DOCTYPE y [
  //    <!ENTITY % b '&#37;c;'>
  //    <!ENTITY % c '&#60;!ENTITY a "x" >'>
  //    %b;
  //   ]>
  //   <y>&nbsp;</y>`,
  //   beautified:
  //     "<!DOCTYPE y [ <!ENTITY % b '&#37;c;'> <!ENTITY % c '&#60;!ENTITY a \"x\" >'> %b; ]>\n<y>\n  &nbsp;\n</y>\n"
  // }
  {
    desc: "Notation element followed by text",
    xml: `<!NOTATION name identifier "helper" >a`,
    beautified: '<!NOTATION name identifier "helper">\na\n'
  },
  {
    desc: "Weird <[ ... ]> syntax (maybe shorthand CDATA?) I once saw",
    xml: `<[a<b></a>]>a`,
    beautified: "<![CDATA[a<b></a>]]>\na\n"
  },
  {
    desc: "HTML5 example",
    xml: `<!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8"/>
  <title>Title of the document</title>
  </head>

  <body>
  Content of the document......
  </body>

  </html> `,
    beautified:
      '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset="UTF-8"/>\n    <title>\n      Title of the document\n    </title>\n  </head>\n  <body>\n    Content of the document......\n  </body>\n</html>\n'
  },
  {
    desc: "XHTML5 example with multiple file input",
    xml: `<!DOCTYPE html> <p><input type="file" multiple/></p> `,
    beautified: '<!DOCTYPE html>\n<p>\n  <input type="file" multiple/>\n</p>\n'
  },
  {
    desc: "HTML script tag followed by text",
    xml: `<script> var t="</closing>"; </script> `,
    beautified: '<script>\n  var t="</closing>";\n</script>\n'
  },
  {
    desc: "Basic JSX attribute",
    xml: "<button onClick={this.element}>",
    beautified: "<button onClick={this.element}>\n"
  },
  {
    desc: "JSX attribute with nesting",
    xml: `<button onClick={this.element.bind(this, () => { something(); }) }>a`,
    beautified:
      "<button onClick={this.element.bind(this, () => { something(); }) }>\n  a\n"
  },
  {
    desc: "JSX attribute with nesting and strings",
    xml: `<button onClick={this.element.bind(this, () => { "123}}}"; something(); }) }>a`,
    beautified: `<button onClick={this.element.bind(this, () => { "123}}}"; something(); }) }>\n  a\n`
  },
  {
    desc: "JSX attribute with nesting and comments",
    xml:
      "<button onClick={this.element.bind(this, () => { // }}}}\n    something(); }) }>a",
    beautified: `<button onClick={this.element.bind(this, () => { // }}}}\n    something(); }) }>\n  a\n`
  },
  {
    desc: "JSX attribute with nesting and multiline comments",
    xml:
      "<button onClick={this.element.bind(this, () => { /* multilinecomment }}}\n  }}\n  // */\n  //\n   something(); }) }>a",
    beautified:
      "<button onClick={this.element.bind(this, () => { /* multilinecomment }}}\n  }}\n  // */\n  //\n   something(); }) }>\n  a\n"
  },
  {
    desc: "JSX attribute with malformed string with linebreak at end",
    xml: `<button onClick={this.element.bind(this, () => { const x = "test\n something(); }) }>a`,
    beautified:
      '<button onClick={this.element.bind(this, () => { const x = "test\n something(); }) }>\n  a\n'
  },
  {
    desc: "JSX attribute with template string and nested expression",
    xml:
      "<button onClick={this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }>a",
    jsx: true,
    beautified:
      "<button onClick={this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }>\n  a\n"
  },
  {
    desc: "JSX inline with template string and nested expression",
    xml:
      "<button>hello{this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }how are you?",
    jsx: true,
    beautified:
      "<button>\n  hello\n  {this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }\n  how are you?\n"
  },
  {
    desc: "JSX example with JSX turned off",
    xml:
      "<button>hello{this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }how are you?",
    jsx: false,
    beautified:
      "<button>\n  hello{this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }how are you?\n"
  },
  {
    desc: "Weird attribute name",
    xml: "<a xml::lang='b'/>",
    beautified: '<a xml::lang="b"/>\n'
  },
  {
    desc: "Script tag can be self-closing in XML mode",
    xml: "<script/>",
    beautified: "<script/>\n"
  },
  {
    desc: "Script tag shouldn't be self-closing when in HTML mode",
    xml: "<script/>",
    html: true,
    beautified: "<script>\n</script>\n"
  },
  {
    desc:
      "Script tag shouldn't be self-closing when in HTML mode with attribute",
    xml: "<script attr/>",
    html: true,
    beautified: "<script attr>\n</script>\n"
  },
  {
    desc:
      "Script tag shouldn't be self-closing when in HTML mode with attribute with different inner text",
    xml: "<script attr> </script>",
    html: true,
    beautified: "<script attr>\n</script>\n"
  },
  {
    desc:
      "Script tag shouldn't be self-closing when in HTML mode with attribute with no inner text",
    xml: "<script attr></script>",
    html: true,
    beautified: "<script attr>\n</script>\n"
  },
  {
    desc: "Script tag shouldn't be self-closing",
    xml: "<script></script>",
    html: true,
    beautified: "<script>\n</script>\n"
  },
  {
    desc:
      "Script tag shouldn't be self-closing when in HTML mode with attribute",
    xml: "<script attr> var what; </script>",
    html: true,
    beautified: "<script attr>\n  var what;\n</script>\n"
  },
  ,
  {
    desc: "Format as HTML",
    xml: "<script attr> var what; </script>",
    html: true,
    output: "html",
    beautified:
      '<span class="b-tag-start">&lt;</span><span class="b-tag">script</span> <span class="b-attr-key">attr</span><span class="b-tag-end">&gt;</span><br/>\n &nbsp;<span class="b-text">var what;</span><br/>\n<span class="b-tag-start">&lt;</span><span class="b-tag-end">/</span><span class="b-tag">script</span><span class="b-tag-end">&gt;</span><br/>\n'
  },
  {
    desc: "Format as HTML with Doctype",
    xml: '<!DOCTYPE html><test some="thing"/>',
    output: "html",
    beautified:
      '<span class="b-doctype">&lt;!DOCTYPE</span> <span class="b-attr-key">html</span><span class="b-tag-end">&gt;</span><br/>\n<span class="b-tag-start">&lt;</span><span class="b-tag">test</span> <span class="b-attr-key">some</span><span class="b-attr-equals">=</span><span class="b-attr-value">&quot;thing&quot;</span><span class="b-tag-end">/</span><span class="b-tag-end">&gt;</span><br/>\n'
  },
  {
    desc: "Format as HTML with Doctype with custom prefix",
    xml: '<!DOCTYPE html><test custom="thing"/>',
    output: "html",
    outputHtmlClassPrefix: "conflict-free-",
    beautified:
      '<span class="conflict-free-doctype">&lt;!DOCTYPE</span> <span class="conflict-free-attr-key">html</span><span class="conflict-free-tag-end">&gt;</span><br/>\n<span class="conflict-free-tag-start">&lt;</span><span class="conflict-free-tag">test</span> <span class="conflict-free-attr-key">custom</span><span class="conflict-free-attr-equals">=</span><span class="conflict-free-attr-value">&quot;thing&quot;</span><span class="conflict-free-tag-end">/</span><span class="conflict-free-tag-end">&gt;</span><br/>\n'
  }
];

describe("lexes", async () =>
  cases.forEach((eachCase, i) => {
    test(`${eachCase.desc} ${eachCase.xml.replace(/\n/g, "\\n")}`, async () => {
      let result;
      try {
        const options = {
          jsx: !!eachCase.jsx,
          html: !!eachCase.html
        };
        if (eachCase.output) {
          options.output = eachCase.output;
        }
        if (eachCase.outputHtmlClassPrefix) {
          options.outputHtmlClassPrefix = eachCase.outputHtmlClassPrefix;
        }
        result = Beautify(eachCase.xml, options);
      } catch (e) {
        console.log(e);
      }
      expect(result).toEqual(eachCase.beautified);
    });
  }));
