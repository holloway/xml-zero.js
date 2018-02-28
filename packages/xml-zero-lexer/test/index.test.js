import Lex, { NodeTypes, NodeTypeKeys } from "../src/index";
import { isEqual } from "lodash";

export const resolve = (xml: string, token: Array<number>) => {
  if (!token || (token.length - 1) % 2 !== 0)
    return "Invalid 'token' variable: " + token;
  return [
    NodeTypeKeys[token[0]],
    ...Array.apply(null, Array((token.length - 1) / 2)).map((w, pairIndex) => {
      const i = 1 + pairIndex * 2;
      return xml.substring(token[i], token[i + 1]);
    })
  ];
};

const resolveNodes = (xml, tokens) => tokens.map(token => resolve(xml, token));

const resolveNodeNumber = (xml: string, token: Array<number>) => {
  return [NodeTypeKeys[token[0]], token.slice(1)];
};

const resolveNodesNumbers = (xml, tokens) => {
  if (!tokens || !tokens.map) return `Not structured. Was ` + tokens;
  return tokens.map(token => resolveNodeNumber(xml, token));
};

var cases = [
  // This variable forked from xml.js https://github.com/nashwaan/xml-js under the MIT licence
  {
    desc: "text",
    xml: "text",
    lex: [[NodeTypes.TEXT_NODE, 0, 5]]
  },
  {
    desc: "his divine shadow",
    xml: "<p>his divine shadow</p>",
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 2],
      [NodeTypes.TEXT_NODE, 3, 20],
      [NodeTypes.CLOSE_ELEMENT]
    ]
  },
  {
    desc:
      "a tag with no name which we will consider to be not self-closing. surrounded by text",
    xml: "text<>test",
    lex: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.TEXT_NODE, 6, 11]
    ]
  },
  {
    desc:
      "text followed by an element that's self-closing element without a name </> ...actually indistinguishable from a closing tag without a name </> but we'll treat it as an element that's self-closing (with distinct .length === 1 so you can tell these apart... and if you want to ignore the open and just consider it a close you can ignore it)",
    xml: "text</>",
    lex: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.CLOSE_ELEMENT]
    ]
  },
  {
    desc: "the tag has no name self-closing followed by text",
    xml: "text</>text",
    lex: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 7, 12]
    ]
  },
  {
    desc: "the tag has no name self-closing followed by text",
    xml: "text< />text",
    lex: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 8, 13]
    ]
  },
  {
    desc: "the tag has no name self-closing followed by text",
    xml: "text< attr/>text",
    lex: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 6, 10],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 12, 17]
    ]
  },
  {
    desc:
      "the tag has no name and has an attribute with a slash and space at the end. the slash is removed to be consistant with parsing of < attr/> but we don't consider it a self-closing element. If you want slashes use quotemarks",
    xml: "text< attr/ >text",
    lex: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 6, 10],
      [NodeTypes.TEXT_NODE, 13, 18]
    ]
  },
  {
    desc:
      "fish tags. note that </> is parsed as an open AND close with .length===1 so you can filter it",
    xml: "<></>",
    lex: [
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.CLOSE_ELEMENT]
    ]
  },
  {
    desc:
      "the tag has no name and has an attribute with a slash and space at the end. the slash is removed to be consistant with parsing of < attr/> but we don't consider it a self-closing element. If you want slashes use quotemarks",
    xml: "text< doc></doc>text",
    lex: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 6, 9],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 16, 21]
    ]
  },
  {
    desc: "declaration",
    xml: "<?xml?>",
    lex: [[NodeTypes.XML_DECLARATION, 2, 5]]
  },
  {
    desc: "declaration with space",
    xml: "<?xml ?>",
    lex: [[NodeTypes.XML_DECLARATION, 2, 5]]
  },
  {
    desc: "declaration with non-wellformed closing",
    xml: "<?xml>",
    lex: [[NodeTypes.XML_DECLARATION, 2, 5]]
  },
  {
    desc: "processing instruction",
    xml: "<?xml-?>",
    lex: [[NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 6]]
  },
  {
    desc: "declaration with attributes",
    xml: '<?xml version="1.0"?>',
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18]
    ]
  },
  {
    desc: "declaration with attribute following whitespace",
    xml: '<?xml version="1.0" ?>',
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18]
    ]
  },
  {
    desc: "declaration with attribute single quotes",
    xml: "<?xml version='1.0'?>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18]
    ]
  },
  {
    desc: "declaration with attribute single quotes value has a > in it",
    xml: "<doc att='2>1'/>",
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 4],
      [NodeTypes.ATTRIBUTE_NODE, 5, 8, 10, 13],
      [NodeTypes.CLOSE_ELEMENT]
    ]
  },
  {
    desc: "declaration with two attributes",
    xml: "<?xml version='1.0' lang=\"en\"    ?>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
      [NodeTypes.ATTRIBUTE_NODE, 20, 24, 26, 28]
    ]
  },
  {
    desc: "declaration with two attributes close together",
    xml: "<?xml version='1.0'lang=\"en\"     ?>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
      [NodeTypes.ATTRIBUTE_NODE, 19, 23, 25, 27]
    ]
  },
  {
    desc: "Processing instruction with attribute",
    xml: '<?xml-stylesheet href="1.0"?>',
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21, 23, 26]
    ]
  },
  {
    desc: "Processing instruction with valueless attribute",
    xml: "<?xml-stylesheet href?>",
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21]
    ]
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute",
    xml: "<?xml-stylesheet href yahoo='serious'?>",
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 27, 29, 36]
    ]
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks",
    xml: "<?xml-stylesheet href yahoo=serious?>",
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 27, 28, 35]
    ]
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing",
    xml: "<?xml-stylesheet href yahoo=serious>",
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 27, 28, 35]
    ]
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name",
    xml: "<?xml-stylesheet href yahoo=serious x>",
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 27, 28, 35],
      [NodeTypes.ATTRIBUTE_NODE, 36, 37]
    ]
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name",
    xml: "<?xml-stylesheet href xx>",
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 24]
    ]
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name and a space",
    xml: "<?xml-stylesheet href xx >",
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 24]
    ]
  },
  {
    desc: "declaration and self-closing element",
    xml: "<?xml?><a/>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.CLOSE_ELEMENT]
    ]
  },
  {
    desc: "declaration and element",
    xml: "<?xml?><a>",
    lex: [[NodeTypes.XML_DECLARATION, 2, 5], [NodeTypes.ELEMENT_NODE, 8, 9]]
  },
  {
    desc: "declaration and two elements",
    xml: "<?xml?><a><b>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.ELEMENT_NODE, 11, 12]
    ]
  },
  {
    desc: "declaration and two elements (one self-closing)",
    xml: "<?xml?><a/><b>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.ELEMENT_NODE, 12, 13]
    ]
  },
  {
    desc: "declaration and two elements (one closing)",
    xml: "<?xml?><a></a><b>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.ELEMENT_NODE, 15, 16]
    ]
  },
  {
    desc: "declaration and two elements (one self-closing)",
    xml: "<?xml?><a></a><b/>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.ELEMENT_NODE, 15, 16],
      [NodeTypes.CLOSE_ELEMENT]
    ]
  },
  {
    desc: "element followed by text",
    xml: "<a>text",
    lex: [[NodeTypes.ELEMENT_NODE, 1, 2], [NodeTypes.TEXT_NODE, 3, 8]]
  },
  {
    desc: "element surrounded by text",
    xml: " <a>text",
    lex: [
      [NodeTypes.TEXT_NODE, 0, 1],
      [NodeTypes.ELEMENT_NODE, 2, 3],
      [NodeTypes.TEXT_NODE, 4, 9]
    ]
  },
  {
    desc: "comment",
    xml: "<!-- test -->",
    lex: [[NodeTypes.COMMENT_NODE, 4, 10]]
  },
  {
    desc: "comment with text before",
    xml: "a<!-- test -->",
    lex: [[NodeTypes.TEXT_NODE, 0, 1], [NodeTypes.COMMENT_NODE, 5, 11]]
  },
  {
    desc: "comment with text before and after",
    xml: "a<!-- test -->b",
    lex: [
      [NodeTypes.TEXT_NODE, 0, 1],
      [NodeTypes.COMMENT_NODE, 5, 11],
      [NodeTypes.TEXT_NODE, 14, 16]
    ]
  },
  {
    desc: "self-closing element",
    xml: "<a/>",
    lex: [[NodeTypes.ELEMENT_NODE, 1, 2], [NodeTypes.CLOSE_ELEMENT]]
  },
  {
    desc: "non-self-closing element",
    xml: "<a>",
    lex: [[NodeTypes.ELEMENT_NODE, 1, 2]]
  },
  {
    desc: "nested elements",
    xml: "<a><b/></a>",
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 2],
      [NodeTypes.ELEMENT_NODE, 4, 5],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.CLOSE_ELEMENT]
    ]
  },
  {
    desc: "declaration and elements",
    xml: "<?xml?><a><b/></a>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.ELEMENT_NODE, 11, 12],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.CLOSE_ELEMENT]
    ]
  },
  {
    desc: "declaration and elements with attributes",
    xml: "<?xml?><a href='http://html5zombo.com'><b/></a>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.ATTRIBUTE_NODE, 10, 14, 16, 37],
      [NodeTypes.ELEMENT_NODE, 40, 41],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.CLOSE_ELEMENT]
    ]
  },
  {
    desc: "declaration with weird self-closing",
    xml: "<?xml/>",
    lex: [[NodeTypes.XML_DECLARATION, 2, 5], [NodeTypes.CLOSE_ELEMENT]]
  },
  {
    desc: "Doctype",
    xml: `<!DOCTYPE html PUBLIC
    "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`,
    lex: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 10, 14],
      [NodeTypes.ATTRIBUTE_NODE, 15, 21],
      [NodeTypes.ATTRIBUTE_NODE, 27, 65],
      [NodeTypes.ATTRIBUTE_NODE, 72, 127]
    ]
  },
  {
    desc: "Doctype followed by text",
    xml: `<!DOCTYPE html PUBLIC
    "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">ab`,
    lex: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 10, 14],
      [NodeTypes.ATTRIBUTE_NODE, 15, 21],
      [NodeTypes.ATTRIBUTE_NODE, 27, 65],
      [NodeTypes.ATTRIBUTE_NODE, 72, 127],
      [NodeTypes.TEXT_NODE, 129, 132]
    ]
  },
  {
    desc: "HTML5 followed by html root tag",
    xml: `<!DOCTYPE html><html>`,
    lex: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 10, 14],
      [NodeTypes.ELEMENT_NODE, 16, 20]
    ]
  },
  {
    desc: "CDATA Section",
    xml: `<![CDATA[ \t <foo></bar> \t ]]>`,
    lex: [[NodeTypes.CDATA_SECTION_NODE, 9, 26]]
  },
  {
    desc: "CDATA Section followed by text",
    xml: `<![CDATA[ \t <foo></bar> \t ]]>abc`,
    lex: [[NodeTypes.CDATA_SECTION_NODE, 9, 26], [NodeTypes.TEXT_NODE, 29, 33]]
  },
  {
    desc: "Entity",
    xml: `<!ENTITY entityname "replacement text">`,
    lex: [
      [NodeTypes.ENTITY_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 9, 19],
      [NodeTypes.ATTRIBUTE_NODE, 21, 37]
    ]
  },
  {
    desc: "Entity followed by text",
    xml: `<!ENTITY entityname "replacement text">a`,
    lex: [
      [NodeTypes.ENTITY_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 9, 19],
      [NodeTypes.ATTRIBUTE_NODE, 21, 37],
      [NodeTypes.TEXT_NODE, 39, 41]
    ]
  },
  {
    desc:
      "Doctype with entity definitions, followed by element with an entity in text node",
    xml: `<!DOCTYPE y [
     <!ENTITY % b '&#37;c;'>
     <!ENTITY % c '&#60;!ENTITY a "x" >'>
     %b;
    ]>
    <y>&nbsp;</y>`,
    lex: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 10, 11],
      [NodeTypes.ATTRIBUTE_NODE, 12, 99],
      [NodeTypes.TEXT_NODE, 100, 105],
      [NodeTypes.ELEMENT_NODE, 106, 107],
      [NodeTypes.TEXT_NODE, 108, 114],
      [NodeTypes.CLOSE_ELEMENT]
    ]
  },
  {
    desc: "Notation element followed by text",
    xml: `<!NOTATION name identifier "helper" >a`,
    lex: [
      [NodeTypes.NOTATION_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 11, 15],
      [NodeTypes.ATTRIBUTE_NODE, 16, 26],
      [NodeTypes.ATTRIBUTE_NODE, 28, 34],
      [NodeTypes.TEXT_NODE, 37, 39]
    ]
  },
  {
    desc: "Weird <[ ... ]> syntax (maybe shorthand CDATA?) I once saw",
    xml: `<[a<b></a>]>a`,
    lex: [[NodeTypes.CDATA_SECTION_NODE, 2, 10], [NodeTypes.TEXT_NODE, 12, 14]]
  },
  {
    desc: "HTML5 example",
    xml: `<!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <title>Title of the document</title>
  </head>

  <body>
  Content of the document......
  </body>

  </html> `,
    lex: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 10, 14],
      [NodeTypes.TEXT_NODE, 15, 18],
      [NodeTypes.ELEMENT_NODE, 19, 23],
      [NodeTypes.TEXT_NODE, 24, 27],
      [NodeTypes.ELEMENT_NODE, 28, 32],
      [NodeTypes.TEXT_NODE, 33, 36],
      [NodeTypes.ELEMENT_NODE, 37, 41],
      [NodeTypes.ATTRIBUTE_NODE, 42, 49, 51, 56],
      [NodeTypes.TEXT_NODE, 58, 61],
      [NodeTypes.ELEMENT_NODE, 62, 67],
      [NodeTypes.TEXT_NODE, 68, 89],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 97, 100],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 107, 111],
      [NodeTypes.ELEMENT_NODE, 112, 116],
      [NodeTypes.TEXT_NODE, 117, 152],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 159, 163],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 170, 172]
    ]
  },
  {
    desc: "XHTML5 example with multiple file input",
    xml: `<!DOCTYPE html> <p><input type="file" multiple/></p> `,
    lex: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 10, 14],
      [NodeTypes.TEXT_NODE, 15, 16],
      [NodeTypes.ELEMENT_NODE, 17, 18],
      [NodeTypes.ELEMENT_NODE, 20, 25],
      [NodeTypes.ATTRIBUTE_NODE, 26, 30, 32, 36],
      [NodeTypes.ATTRIBUTE_NODE, 38, 46],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 52, 54]
    ]
  },
  {
    desc: "HTML5 equivalent of preceding example with self-closing <input>",
    xml: `<!DOCTYPE html> <p><input type="file" multiple></p> `,
    html: true,
    lex: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 10, 14],
      [NodeTypes.TEXT_NODE, 15, 16],
      [NodeTypes.ELEMENT_NODE, 17, 18],
      [NodeTypes.ELEMENT_NODE, 20, 25],
      [NodeTypes.ATTRIBUTE_NODE, 26, 30, 32, 36],
      [NodeTypes.ATTRIBUTE_NODE, 38, 46],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 51, 53]
    ]
  },
  {
    desc: "HTML5 self-closing tags without attributes",
    xml: `<br><img>`,
    html: true,
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 3],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.ELEMENT_NODE, 5, 8],
      [NodeTypes.CLOSE_ELEMENT]
    ]
  },
  {
    desc:
      "HTML script tag followed by text that shouldn't be interpreted as closing tag",
    xml: `<script> var t="</closing>"; </script> `,
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.TEXT_NODE, 8, 29],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 38, 40]
    ]
  },
  {
    desc: "Basic JSX attribute",
    xml: "<button onClick={this.element}>",
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 29]
    ]
  },
  {
    desc: "Basic JSX spread",
    xml: "<button {...obj}>",
    lex: [[NodeTypes.ELEMENT_NODE, 1, 7], [NodeTypes.JSX_ATTRIBUTE, 9, 15]]
  },
  {
    desc: "JSX attribute with nesting",
    xml: `<button onClick={this.element.bind(this, () => { something(); }) }>a`,
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 65],
      [NodeTypes.TEXT_NODE, 67, 69]
    ]
  },
  {
    desc: "JSX attribute with nesting and strings",
    xml: `<button onClick={this.element.bind(this, () => { "123}}}"; something(); }) }>a`,
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 75],
      [NodeTypes.TEXT_NODE, 77, 79]
    ]
  },
  {
    desc: "JSX attribute with nesting and comments",
    xml: `<button onClick={this.element.bind(this, () => { // }}}}
    something(); }) }>a`,
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 77],
      [NodeTypes.TEXT_NODE, 79, 81]
    ]
  },
  {
    desc: "JSX attribute with nesting and multiline comments",
    xml: `<button onClick={this.element.bind(this, () => { /* }}}}
  }}
  */
    something(); }) }>a`,
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 87],
      [NodeTypes.TEXT_NODE, 89, 91]
    ]
  },
  {
    desc: "JSX attribute with malformed string with linebreak at end",
    xml: `<button onClick={this.element.bind(this, () => { const x = "test
    something(); }) }>a`,
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 85],
      [NodeTypes.TEXT_NODE, 87, 89]
    ]
  },
  {
    desc: "JSX attribute with template string and nested expression",
    xml:
      "<button onClick={this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }>a",
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 114],
      [NodeTypes.TEXT_NODE, 116, 118]
    ],
    jsx: true
  },
  {
    desc: "JSX inline with template string and nested expression",
    xml:
      "<button>hello{this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }how are you?",
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.TEXT_NODE, 8, 13],
      [NodeTypes.JSX, 14, 111],
      [NodeTypes.TEXT_NODE, 112, 125]
    ],
    jsx: true
  },
  {
    desc: "JSX example with JSX turned off",
    xml:
      "<button>hello{this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }how are you?",
    lex: [[NodeTypes.ELEMENT_NODE, 1, 7], [NodeTypes.TEXT_NODE, 8, 125]],
    jsx: false
  },
  {
    desc: "Weird attribute name",
    xml: "<a xml::lang='b'/>",
    lex: [
      [NodeTypes.ELEMENT_NODE, 1, 2],
      [NodeTypes.ATTRIBUTE_NODE, 3, 12, 14, 15],
      [NodeTypes.CLOSE_ELEMENT]
    ]
  }
];

describe("lexes", async () =>
  cases.forEach((eachCase, i) => {
    test(`${eachCase.desc} ${eachCase.xml}`, async () => {
      let result;
      try {
        result = Lex(eachCase.xml, {
          jsx: !!eachCase.jsx,
          html: !!eachCase.html
        });
      } catch (e) {
        console.log(e);
      }

      if (!isEqual(result, eachCase.lex)) {
        console.log("Not equal");
        console.log(resolveNodesNumbers(eachCase.xml, result));
        console.log("after");
        try {
          result = Lex(eachCase.xml, {
            jsx: !!eachCase.jsx,
            html: !!eachCase.html
          });
        } catch (e) {}
        if (result) {
          console.log("Result:", result, " from ", eachCase.xml);
          console.log(resolveNodes(eachCase.xml, result));
        }
      } else {
        // if (i === cases.length - 1) {
        //   console.log(resolveNodes(eachCase.xml, result));
        // }
      }

      expect(result).toEqual(eachCase.lex);
    });
  }));

describe("Constants", async () =>
  test(`Constants`, async () => {
    const keys = [
      "XML_DECLARATION",
      "ELEMENT_NODE",
      "ATTRIBUTE_NODE",
      "TEXT_NODE",
      "CDATA_SECTION_NODE",
      "ENTITY_REFERENCE_NODE",
      "ENTITY_NODE",
      "PROCESSING_INSTRUCTION_NODE",
      "COMMENT_NODE",
      "DOCUMENT_NODE",
      "DOCUMENT_TYPE_NODE",
      "DOCUMENT_FRAGMENT_NODE",
      "NOTATION_NODE",
      "CLOSE_ELEMENT",
      "JSX_ATTRIBUTE",
      "JSX"
    ];

    expect(NodeTypeKeys).toEqual(keys);

    const testKeys = Object.keys(NodeTypes);
    testKeys.forEach(key => {
      expect(NodeTypes[key]).toEqual(keys.indexOf(key));
    });
  }));
