import Beautify from "../src/index";

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
  }
  //   {
  //     desc: "declaration with two attributes",
  //     xml: "<?xml version='1.0' lang=\"en\"    ?>"
  //   },
  //   {
  //     desc: "declaration with two attributes close together",
  //     xml: "<?xml version='1.0'lang=\"en\"     ?>"
  //   },
  //   {
  //     desc: "Processing instruction with attribute",
  //     xml: '<?xml-stylesheet href="1.0"?>'
  //   },
  //   {
  //     desc: "Processing instruction with valueless attribute",
  //     xml: "<?xml-stylesheet href?>"
  //   },
  //   {
  //     desc:
  //       "Processing instruction with valueless attribute followed by regular attribute",
  //     xml: "<?xml-stylesheet href yahoo='serious'?>"
  //   },
  //   {
  //     desc:
  //       "Processing instruction with valueless attribute followed by regular attribute without speechmarks",
  //     xml: "<?xml-stylesheet href yahoo=serious?>"
  //   },
  //   {
  //     desc:
  //       "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing",
  //     xml: "<?xml-stylesheet href yahoo=serious>"
  //   },
  //   {
  //     desc:
  //       "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name",
  //     xml: "<?xml-stylesheet href yahoo=serious x>"
  //   },
  //   {
  //     desc:
  //       "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name",
  //     xml: "<?xml-stylesheet href xx>"
  //   },
  //   {
  //     desc:
  //       "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name and a space",
  //     xml: "<?xml-stylesheet href xx >"
  //   },
  //   {
  //     desc: "declaration and self-closing element",
  //     xml: "<?xml?><a/>"
  //   },
  //   {
  //     desc: "declaration and element",
  //     xml: "<?xml?><a>"
  //   },
  //   {
  //     desc: "declaration and two elements",
  //     xml: "<?xml?><a><b>"
  //   },
  //   {
  //     desc: "declaration and two elements (one self-closing)",
  //     xml: "<?xml?><a/><b>"
  //   },
  //   {
  //     desc: "declaration and two elements (one closing)",
  //     xml: "<?xml?><a></a><b>"
  //   },
  //   {
  //     desc: "declaration and two elements (one self-closing)",
  //     xml: "<?xml?><a></a><b/>"
  //   },
  //   {
  //     desc: "element followed by text",
  //     xml: "<a>text"
  //   },
  //   {
  //     desc: "element surrounded by text",
  //     xml: " <a>text"
  //   },
  //   {
  //     desc: "comment",
  //     xml: "<!-- test -->"
  //   },
  //   {
  //     desc: "comment with text before",
  //     xml: "a<!-- test -->"
  //   },
  //   {
  //     desc: "comment with text before and after",
  //     xml: "a<!-- test -->b"
  //   },
  //   {
  //     desc: "self-closing element",
  //     xml: "<a/>"
  //   },
  //   {
  //     desc: "non-self-closing element",
  //     xml: "<a>"
  //   },
  //   {
  //     desc: "nested elements",
  //     xml: "<a><b/></a>"
  //   },
  //   {
  //     desc: "declaration and elements",
  //     xml: "<?xml?><a><b/></a>"
  //   },
  //   {
  //     desc: "declaration and elements with attributes",
  //     xml: "<?xml?><a href='http://html5zombo.com'><b/></a>"
  //   },
  //   {
  //     desc: "declaration with weird self-closing",
  //     xml: "<?xml/>"
  //   },
  //   {
  //     desc: "Doctype",
  //     xml: `<!DOCTYPE html PUBLIC
  //   "-//W3C//DTD XHTML 1.0 Transitional//EN"
  //   "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`
  //   },
  //   {
  //     desc: "Doctype followed by text",
  //     xml: `<!DOCTYPE html PUBLIC
  //   "-//W3C//DTD XHTML 1.0 Transitional//EN"
  //   "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">ab`
  //   },
  //   {
  //     desc: "HTML5 followed by html root tag",
  //     xml: `<!DOCTYPE html><html>`
  //   },
  //   {
  //     desc: "CDATA Section",
  //     xml: `<![CDATA[ \t <foo></bar> \t ]]>`
  //   },
  //   {
  //     desc: "CDATA Section followed by text",
  //     xml: `<![CDATA[ \t <foo></bar> \t ]]>abc`
  //   },
  //   {
  //     desc: "Entity",
  //     xml: `<!ENTITY entityname "replacement text">`
  //   },
  //   {
  //     desc: "Entity followed by text",
  //     xml: `<!ENTITY entityname "replacement text">a`
  //   },
  //   {
  //     desc:
  //       "Doctype with entity definitions, followed by element with an entity in text node",
  //     xml: `<!DOCTYPE y [
  //    <!ENTITY % b '&#37;c;'>
  //    <!ENTITY % c '&#60;!ENTITY a "x" >'>
  //    %b;
  //   ]>
  //   <y>&nbsp;</y>`
  //   },
  //   {
  //     desc: "Notation element followed by text",
  //     xml: `<!NOTATION name identifier "helper" >a`
  //   },
  //   {
  //     desc: "Weird <[ ... ]> syntax (maybe shorthand CDATA?) I once saw",
  //     xml: `<[a<b></a>]>a`
  //   },
  //   {
  //     desc: "HTML5 example",
  //     xml: `<!DOCTYPE html>
  // <html>
  // <head>
  // <meta charset="UTF-8">
  // <title>Title of the document</title>
  // </head>

  // <body>
  // Content of the document......
  // </body>

  // </html> `
  //   },
  //   {
  //     desc: "HTML5 example with multiple file input",
  //     xml: `<!DOCTYPE html> <p><input type="file" multiple></p> `
  //   },
  //   {
  //     desc: "HTML script tag followed by text",
  //     xml: `<script> var t="</closing>"; </script> `
  //   },
  //   {
  //     desc: "Basic JSX attribute",
  //     xml: "<button onClick={this.element}>"
  //   },
  //   {
  //     desc: "JSX attribute with nesting",
  //     xml: `<button onClick={this.element.bind(this, () => { something(); }) }>a`
  //   },
  //   {
  //     desc: "JSX attribute with nesting and strings",
  //     xml: `<button onClick={this.element.bind(this, () => { "123}}}"; something(); }) }>a`
  //   },
  //   {
  //     desc: "JSX attribute with nesting and comments",
  //     xml: `<button onClick={this.element.bind(this, () => { // }}}}
  //   something(); }) }>a`
  //   },
  //   {
  //     desc: "JSX attribute with nesting and multiline comments",
  //     xml: `<button onClick={this.element.bind(this, () => { /* }}}}
  // }}
  // */
  //   something(); }) }>a`
  //   },
  //   {
  //     desc: "JSX attribute with malformed string with linebreak at end",
  //     xml: `<button onClick={this.element.bind(this, () => { const x = "test
  //   something(); }) }>a`
  //   },
  //   {
  //     desc: "JSX attribute with template string and nested expression",
  //     xml:
  //       "<button onClick={this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }>a",
  //     jsx: true
  //   },
  //   {
  //     desc: "JSX inline with template string and nested expression",
  //     xml:
  //       "<button>hello{this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }how are you?",
  //     jsx: true
  //   },
  //   {
  //     desc: "JSX example with JSX turned off",
  //     xml:
  //       "<button>hello{this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }how are you?",
  //     jsx: false
  //   },
  //   {
  //     desc: "Weird attribute name",
  //     xml: "<a xml::lang='b'/>"
  //   }
];

describe("lexes", async () =>
  cases.forEach((eachCase, i) => {
    test(`${eachCase.desc} ${eachCase.xml}`, async () => {
      let result;
      try {
        result = Beautify(eachCase.xml, { jsx: !!eachCase.jsx });
      } catch (e) {
        console.log(e);
      }
      expect(result).toEqual(eachCase.beautified);
    });
  }));
