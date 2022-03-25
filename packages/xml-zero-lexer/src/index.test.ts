import Lexx, { Token, NodeTypes, NodeTypeKeys } from "./index";
import { isEqual } from "lodash";

export const resolve = (input: string, token: Token) => {
  if (!token || (token.length - 1) % 2 !== 0)
    return "Invalid 'token' variable: " + token;

  const tokenZero = token[0];

  return [
    NodeTypeKeys[tokenZero],
    ...Array.apply(null, Array((token.length - 1) / 2)).map((w, pairIndex) => {
      const i = 1 + pairIndex * 2;
      const tokenI = token[i];
      if (tokenI === undefined) throw Error(`Internal error`);
      return input.substring(tokenI, token[i + 1]);
    }),
  ];
};

const resolveNodes = (input: string, tokens: Token[]) =>
  tokens.map((token) => resolve(input, token));

const resolveNodeNumber = (input: string, token: Token) => {
  return [NodeTypeKeys[token[0]], token.slice(1)];
};

const resolveNodesNumbers = (input: string, tokens: Token[]) => {
  if (!tokens || !tokens.map) return `Not structured. Was ` + tokens;
  return tokens.map((token) => resolveNodeNumber(input, token));
};

type Case = {
  description: string;
  input: string;
  jsx?: boolean;
  html?: boolean;
  expectedResult: Token[];
};

const cases: Case[] = [
  //
  // Welcome to the test cases.
  //
  // Please enjoy your stay on this internet website.
  //
  // This variable of test data was origially forked from xml.js
  // https://github.com/nashwaan/xml-js under the MIT licence
  // but later expanded by xml-zero-lexer to include
  // React-JSX and HTML5 test cases.
  //
  {
    description: "can parse text",
    input: "text",
    expectedResult: [[NodeTypes.TEXT_NODE, 0, 5]],
  },
  {
    description: "can parse element with text child node",
    input: "<p>his divine shadow</p>",
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 2],
      [NodeTypes.TEXT_NODE, 3, 20],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description:
      "a tag with no name which we will consider to be a React Fragment <> so not self-closing",
    input: "text<>test",
    expectedResult: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.TEXT_NODE, 6, 11],
    ],
  },
  {
    description:
      "text followed by a closing element without a name that we will consider to be a React Fragment.",
    input: "text</>",
    expectedResult: [[NodeTypes.TEXT_NODE, 0, 4], [NodeTypes.CLOSE_ELEMENT]],
  },
  {
    description: "the tag has no name self-closing followed by text",
    input: "text</>text",
    expectedResult: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 7, 12],
    ],
  },
  {
    description: "the tag has no name self-closing followed by text",
    input: "text< />text",
    expectedResult: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 8, 13],
    ],
  },
  {
    description: "the tag has no name self-closing followed by text",
    input: "text< attr/>text",
    expectedResult: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 6, 10],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 12, 17],
    ],
  },
  {
    description:
      "the tag has no name and has an attribute with a slash and space at the end. the slash is removed to be consistant with parsing of < attr/> but we don't consider it a self-closing element because the slash isn't at the end.",
    input: "text< attr/ >text",
    expectedResult: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 6, 10],
      [NodeTypes.TEXT_NODE, 13, 18],
    ],
  },
  {
    description:
      "React-JSX fragment (aka fish tags, because it looks like a fish, sort of). <> is open and </> is close.",
    input: "<></>",
    expectedResult: [[NodeTypes.ELEMENT_NODE], [NodeTypes.CLOSE_ELEMENT]],
  },
  {
    description:
      "the tag has no name and has an attribute with a slash and space at the end. the slash is removed to be consistant with parsing of < attr/> but we don't consider it a self-closing element.",
    input: "text< doc></doc>text",
    expectedResult: [
      [NodeTypes.TEXT_NODE, 0, 4],
      [NodeTypes.ELEMENT_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 6, 9],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 16, 21],
    ],
  },
  {
    description: "declaration",
    input: "<?xml?>",
    expectedResult: [[NodeTypes.XML_DECLARATION, 2, 5]],
  },
  {
    description: "declaration with space",
    input: "<?xml ?>",
    expectedResult: [[NodeTypes.XML_DECLARATION, 2, 5]],
  },
  {
    description: "declaration with non-wellformed closing",
    input: "<?xml>",
    expectedResult: [[NodeTypes.XML_DECLARATION, 2, 5]],
  },
  {
    description: "processing instruction",
    input: "<?xml-?>",
    expectedResult: [[NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 6]],
  },
  {
    description: "declaration with attributes",
    input: '<?xml version="1.0"?>',
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
    ],
  },
  {
    description: "declaration with attribute following whitespace",
    input: '<?xml version="1.0" ?>',
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
    ],
  },
  {
    description: "declaration with attribute single quotes",
    input: "<?xml version='1.0'?>",
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
    ],
  },
  {
    description: "declaration with attribute single quotes value has a > in it",
    input: "<doc att='2>1'/>",
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 4],
      [NodeTypes.ATTRIBUTE_NODE, 5, 8, 10, 13],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description: "declaration with two attributes",
    input: "<?xml version='1.0' lang=\"en\"    ?>",
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
      [NodeTypes.ATTRIBUTE_NODE, 20, 24, 26, 28],
    ],
  },
  {
    description: "declaration with two attributes close together",
    input: "<?xml version='1.0'lang=\"en\"     ?>",
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
      [NodeTypes.ATTRIBUTE_NODE, 19, 23, 25, 27],
    ],
  },
  {
    description: "Processing instruction with attribute",
    input: '<?xml-stylesheet href="1.0"?>',
    expectedResult: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21, 23, 26],
    ],
  },
  {
    description: "Processing instruction with valueless attribute",
    input: "<?xml-stylesheet href?>",
    expectedResult: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
    ],
  },
  {
    description:
      "Processing instruction with valueless attribute followed by regular attribute",
    input: "<?xml-stylesheet href yahoo='serious'?>",
    expectedResult: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 27, 29, 36],
    ],
  },
  {
    description:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks",
    input: "<?xml-stylesheet href yahoo=serious?>",
    expectedResult: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 27, 28, 35],
    ],
  },
  {
    description:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing",
    input: "<?xml-stylesheet href yahoo=serious>",
    expectedResult: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 27, 28, 35],
    ],
  },
  {
    description:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name",
    input: "<?xml-stylesheet href yahoo=serious x>",
    expectedResult: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 27, 28, 35],
      [NodeTypes.ATTRIBUTE_NODE, 36, 37],
    ],
  },
  {
    description:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name",
    input: "<?xml-stylesheet href xx>",
    expectedResult: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 24],
    ],
  },
  {
    description:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name and a space",
    input: "<?xml-stylesheet href xx >",
    expectedResult: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 24],
    ],
  },
  {
    description: "declaration and self-closing element",
    input: "<?xml?><a/>",
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description: "declaration and element",
    input: "<?xml?><a>",
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
    ],
  },
  {
    description: "declaration and two elements",
    input: "<?xml?><a><b>",
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.ELEMENT_NODE, 11, 12],
    ],
  },
  {
    description: "declaration and two elements (one self-closing)",
    input: "<?xml?><a/><b>",
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.ELEMENT_NODE, 12, 13],
    ],
  },
  {
    description: "declaration and two elements (one closing)",
    input: "<?xml?><a></a><b>",
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.ELEMENT_NODE, 15, 16],
    ],
  },
  {
    description: "declaration and two elements (one self-closing)",
    input: "<?xml?><a></a><b/>",
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.ELEMENT_NODE, 15, 16],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description: "element followed by text",
    input: "<a>text",
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 2],
      [NodeTypes.TEXT_NODE, 3, 8],
    ],
  },
  {
    description:
      "element surrounded by text (whitespace char and the string 'text')",
    input: " <a>text",
    expectedResult: [
      [NodeTypes.TEXT_NODE, 0, 1],
      [NodeTypes.ELEMENT_NODE, 2, 3],
      [NodeTypes.TEXT_NODE, 4, 9],
    ],
  },
  {
    description: "comment",
    input: "<!-- test -->",
    expectedResult: [[NodeTypes.COMMENT_NODE, 4, 10]],
  },
  {
    description: "comment with text before",
    input: "a<!-- test -->",
    expectedResult: [
      [NodeTypes.TEXT_NODE, 0, 1],
      [NodeTypes.COMMENT_NODE, 5, 11],
    ],
  },
  {
    description: "comment with text before and after",
    input: "a<!-- test -->b",
    expectedResult: [
      [NodeTypes.TEXT_NODE, 0, 1],
      [NodeTypes.COMMENT_NODE, 5, 11],
      [NodeTypes.TEXT_NODE, 14, 16],
    ],
  },
  {
    description: "self-closing element",
    input: "<a/>",
    expectedResult: [[NodeTypes.ELEMENT_NODE, 1, 2], [NodeTypes.CLOSE_ELEMENT]],
  },
  {
    description: "non-self-closing element",
    input: "<a>",
    expectedResult: [[NodeTypes.ELEMENT_NODE, 1, 2]],
  },
  {
    description: `element is parsed as '<"p>' with valueless attributes 'o' and 'b"'. The closing element's attributes and whitespace are ignored`,
    input: `<"p o b">his divine shadow</"p o b">`,
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 3],
      [NodeTypes.ATTRIBUTE_NODE, 4, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 8],
      [NodeTypes.TEXT_NODE, 9, 26],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description: "nested elements",
    input: "<a><b/></a>",
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 2],
      [NodeTypes.ELEMENT_NODE, 4, 5],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description: "declaration and elements",
    input: "<?xml?><a><b/></a>",
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.ELEMENT_NODE, 11, 12],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description: "declaration and elements with attributes",
    input: "<?xml?><a href='http://html5zombo.com'><b/></a>",
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ELEMENT_NODE, 8, 9],
      [NodeTypes.ATTRIBUTE_NODE, 10, 14, 16, 37],
      [NodeTypes.ELEMENT_NODE, 40, 41],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description: "declaration with weird self-closing",
    input: "<?xml/>",
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description: "Doctype",
    input: `<!DOCTYPE html PUBLIC
    "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`,
    expectedResult: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      /* Treating these all as 4 distinct valueless attributes (4×2 indexes)
         not 2 attributes with values (2×4 indexes)
         because there's no = char between them so I'll parse them as
         separate attributes
      */
      [NodeTypes.ATTRIBUTE_NODE, 10, 14],
      [NodeTypes.ATTRIBUTE_NODE, 15, 21],
      /* The "" characters on the last two attributes aren't included in the
         indexes because it's reversible from parsing the attribute name string
         for characters that need escaping. Exact serialization rules will vary
         depending on your serialization target format.
      */
      [NodeTypes.ATTRIBUTE_NODE, 27, 65],
      [NodeTypes.ATTRIBUTE_NODE, 72, 127],
    ],
  },
  {
    description: "Doctype followed by text",
    input: `<!DOCTYPE html PUBLIC
    "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">ab`,
    expectedResult: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 10, 14],
      [NodeTypes.ATTRIBUTE_NODE, 15, 21],
      [NodeTypes.ATTRIBUTE_NODE, 27, 65],
      [NodeTypes.ATTRIBUTE_NODE, 72, 127],
      [NodeTypes.TEXT_NODE, 129, 132],
    ],
  },
  {
    description: "HTML5 followed by html root tag",
    input: `<!DOCTYPE html><html>`,
    expectedResult: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 10, 14],
      [NodeTypes.ELEMENT_NODE, 16, 20],
    ],
  },
  {
    description: "CDATA Section",
    input: `<![CDATA[ \t <foo></bar> \t ]]>`,
    expectedResult: [[NodeTypes.CDATA_SECTION_NODE, 9, 26]],
  },
  {
    description: "CDATA Section followed by text",
    input: `<![CDATA[ \t <foo></bar> \t ]]>abc`,
    expectedResult: [
      [NodeTypes.CDATA_SECTION_NODE, 9, 26],
      [NodeTypes.TEXT_NODE, 29, 33],
    ],
  },
  {
    description: "Entity",
    input: `<!ENTITY entityname "replacement text">`,
    expectedResult: [
      [NodeTypes.ENTITY_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 9, 19],
      [NodeTypes.ATTRIBUTE_NODE, 21, 37],
    ],
  },
  {
    description: "Entity followed by text",
    input: `<!ENTITY entityname "replacement text">a`,
    expectedResult: [
      [NodeTypes.ENTITY_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 9, 19],
      [NodeTypes.ATTRIBUTE_NODE, 21, 37],
      [NodeTypes.TEXT_NODE, 39, 41],
    ],
  },
  {
    description:
      "Doctype with entity definitions, followed by element with an entity in text node",
    input: `<!DOCTYPE y [
     <!ENTITY % b '&#37;c;'>
     <!ENTITY % c '&#60;!ENTITY a "x" >'>
     %b;
    ]>
    <y>&nbsp;</y>`,
    expectedResult: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 10, 11], // the valueless attribute letter 'y'
      [NodeTypes.ATTRIBUTE_NODE, 12, 99], // the valuesless attribute string [\n<!ENTITY (...)
      [NodeTypes.TEXT_NODE, 100, 105],
      [NodeTypes.ELEMENT_NODE, 106, 107],
      [NodeTypes.TEXT_NODE, 108, 114],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description: "Notation element followed by text",
    input: `<!NOTATION name identifier "helper" >a`,
    expectedResult: [
      [NodeTypes.NOTATION_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 11, 15],
      [NodeTypes.ATTRIBUTE_NODE, 16, 26],
      [NodeTypes.ATTRIBUTE_NODE, 28, 34],
      [NodeTypes.TEXT_NODE, 37, 39],
    ],
  },
  {
    description: "Weird <[ ... ]> syntax (maybe shorthand CDATA?) I once saw",
    input: `<[a<b></a>]>a`,
    expectedResult: [
      [NodeTypes.CDATA_SECTION_NODE, 2, 10],
      [NodeTypes.TEXT_NODE, 12, 14],
    ],
  },
  {
    description: "HTML5 example",
    input: `<!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <title>Title of the document</title>
  </head>

  <body>
  Content of the document......
  </body>

  </html> `,
    expectedResult: [
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
      [NodeTypes.TEXT_NODE, 170, 172],
    ],
  },
  {
    description: "XHTML5 example with multiple file input",
    input: `<!DOCTYPE html> <p><input type="file" multiple/></p> `,
    expectedResult: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 10, 14],
      [NodeTypes.TEXT_NODE, 15, 16],
      [NodeTypes.ELEMENT_NODE, 17, 18],
      [NodeTypes.ELEMENT_NODE, 20, 25],
      [NodeTypes.ATTRIBUTE_NODE, 26, 30, 32, 36],
      [NodeTypes.ATTRIBUTE_NODE, 38, 46],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 52, 54],
    ],
  },
  {
    description:
      "HTML5 equivalent of preceding example with self-closing <input>",
    input: `<!DOCTYPE html> <p><input type="file" multiple></p> `,
    html: true,
    expectedResult: [
      [NodeTypes.DOCUMENT_TYPE_NODE],
      [NodeTypes.ATTRIBUTE_NODE, 10, 14],
      [NodeTypes.TEXT_NODE, 15, 16],
      [NodeTypes.ELEMENT_NODE, 17, 18],
      [NodeTypes.ELEMENT_NODE, 20, 25],
      [NodeTypes.ATTRIBUTE_NODE, 26, 30, 32, 36],
      [NodeTypes.ATTRIBUTE_NODE, 38, 46],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 51, 53],
    ],
  },
  {
    description: "HTML5 self-closing tags without attributes",
    input: `<br><img>`,
    html: true,
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 3],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.ELEMENT_NODE, 5, 8],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description:
      "HTML5 self-closing tags without attributes but with HTML parsing mode off so it should be interpreted as opening <br> and opening <img> with no closing tags",
    input: `<br><img>`,
    html: false,
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 3],
      [NodeTypes.ELEMENT_NODE, 5, 8],
    ],
  },
  {
    description:
      "HTML script tag followed by text that shouldn't be interpreted as closing tag",
    input: `<script> var t="</closing>"; </script> `,
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.TEXT_NODE, 8, 29],
      [NodeTypes.CLOSE_ELEMENT],
      [NodeTypes.TEXT_NODE, 38, 40],
    ],
  },
  {
    description: "Basic JSX attribute",
    input: "<button onClick={this.element}>",
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 29],
    ],
  },
  {
    description: "Basic JSX spread",
    input: "<button {...obj}>",
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 9, 15],
    ],
  },
  {
    description: "JSX attribute with nesting",
    input: `<button onClick={this.element.bind(this, () => { something(); }) }>a`,
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 65],
      [NodeTypes.TEXT_NODE, 67, 69],
    ],
  },
  {
    description: "JSX attribute with nesting and strings",
    input: `<button onClick={this.element.bind(this, () => { "123}}}"; something(); }) }>a`,
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 75],
      [NodeTypes.TEXT_NODE, 77, 79],
    ],
  },
  {
    description: "JSX attribute with nesting and comments",
    input: `<button onClick={this.element.bind(this, () => { // }}}}
    something(); }) }>a`,
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 77],
      [NodeTypes.TEXT_NODE, 79, 81],
    ],
  },
  {
    description: "JSX attribute with nesting and multiline comments",
    input: `<button onClick={this.element.bind(this, () => { /* }}}}
  }}
  */
    something(); }) }>a`,
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 87],
      [NodeTypes.TEXT_NODE, 89, 91],
    ],
  },
  {
    description: "JSX attribute with malformed string with linebreak at end",
    input: `<button onClick={this.element.bind(this, () => { const x = "test
    something(); }) }>a`,
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 85],
      [NodeTypes.TEXT_NODE, 87, 89],
    ],
  },
  {
    description: "JSX attribute with template string and nested expression",
    input:
      "<button onClick={this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }>a",
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 114],
      [NodeTypes.TEXT_NODE, 116, 118],
    ],
    jsx: true,
  },
  {
    description:
      "JSX inline with template string and nested expression and JSX option turned on",
    input:
      "<button>hello{this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }how are you?",
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.TEXT_NODE, 8, 13],
      [NodeTypes.JSX, 14, 111],
      [NodeTypes.TEXT_NODE, 112, 125],
    ],
    jsx: true,
  },
  {
    description: "JSX example with JSX option turned off",
    input:
      "<button>hello{this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }how are you?",
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 7],
      [NodeTypes.TEXT_NODE, 8, 125],
    ],
    jsx: false,
  },
  {
    description: "Weird attribute name",
    input: "<a input::lang='b'/>",
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 2],
      [NodeTypes.ATTRIBUTE_NODE, 3, 14, 16, 17],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description: "Declaration with empty attribute value",
    input: '<?xml version=""?><root></root>',
    expectedResult: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 15],
      [NodeTypes.ELEMENT_NODE, 19, 23],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description: "POJO in JSX attribute twice",
    input: `<Text id="myid" labelHtml={{en: "My label"}} anotherLabelHtml={{en: "My label"}}/>`,
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 8, 10, 14],
      [NodeTypes.JSX_ATTRIBUTE, 16, 25, 27, 43],
      [NodeTypes.JSX_ATTRIBUTE, 45, 61, 63, 79],
      [NodeTypes.CLOSE_ELEMENT],
    ],
  },
  {
    description: "Variable attribute length",
    input: '<a href="//zombo.com" hidden>',
    expectedResult: [
      [NodeTypes.ELEMENT_NODE, 1, 2],
      [NodeTypes.ATTRIBUTE_NODE, 3, 7, 9, 20],
      [NodeTypes.ATTRIBUTE_NODE, 22, 28],
    ],
  },
];

test("lexes", async () => {
  await Promise.all(
    cases.map((eachCase, i) => {
      let result;
      try {
        result = Lexx(eachCase.input, {
          jsx: !!eachCase.jsx,
          html: !!eachCase.html,
        });
      } catch (e) {
        console.log(e);
        throw e;
      }

      if (!isEqual(result, eachCase.expectedResult)) {
        console.log("Not equal", `"${eachCase.description}"`);
        console.log("From input of ", eachCase.input);
        console.log("Expected:", resolveNodesNumbers(eachCase.input, result));
        try {
          result = Lexx(eachCase.input, {
            jsx: !!eachCase.jsx,
            html: !!eachCase.html,
          });
        } catch (e) {}
        if (result) {
          console.log("Received:", result);
          console.log(
            "Which indexes the input as",
            resolveNodes(eachCase.input, result)
          );
        }
      } else {
        // if (i === cases.length - 1) {
        //   console.log(resolveNodes(eachCase.xml, result));
        // }
      }

      expect(result).toEqual(eachCase.expectedResult);
    })
  );
});

test("Constants", async () => {
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
    "JSX",
  ] as const;

  expect(NodeTypeKeys).toEqual(keys);

  // @ts-ignore
  const testKeys: (keyof typeof NodeTypes)[] = Object.keys(NodeTypes);

  testKeys.forEach((key) => {
    expect(NodeTypes[key]).toEqual(keys.indexOf(key));
  });
});
