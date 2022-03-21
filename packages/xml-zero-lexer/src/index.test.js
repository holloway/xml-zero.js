"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = void 0;
const index_1 = __importStar(require("./index"));
const lodash_1 = require("lodash");
const resolve = (xml, token) => {
    if (!token || (token.length - 1) % 2 !== 0)
        return "Invalid 'token' variable: " + token;
    const tokenZero = token[0];
    return [
        index_1.NodeTypeKeys[tokenZero],
        ...Array.apply(null, Array((token.length - 1) / 2)).map((w, pairIndex) => {
            const i = 1 + pairIndex * 2;
            const tokenI = token[i];
            if (tokenI === undefined)
                throw Error(`Internal error`);
            return xml.substring(tokenI, token[i + 1]);
        }),
    ];
};
exports.resolve = resolve;
const resolveNodes = (xml, tokens) => tokens.map((token) => (0, exports.resolve)(xml, token));
const resolveNodeNumber = (xml, token) => {
    return [index_1.NodeTypeKeys[token[0]], token.slice(1)];
};
const resolveNodesNumbers = (xml, tokens) => {
    if (!tokens || !tokens.map)
        return `Not structured. Was ` + tokens;
    return tokens.map((token) => resolveNodeNumber(xml, token));
};
var cases = [
    // This variable forked from xml.js https://github.com/nashwaan/xml-js under the MIT licence
    {
        desc: "text",
        xml: "text",
        lex: [[index_1.NodeTypes.TEXT_NODE, 0, 5]],
    },
    {
        desc: "his divine shadow",
        xml: "<p>his divine shadow</p>",
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 2],
            [index_1.NodeTypes.TEXT_NODE, 3, 20],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
    {
        desc: "a tag with no name which we will consider to be not self-closing. surrounded by text",
        xml: "text<>test",
        lex: [
            [index_1.NodeTypes.TEXT_NODE, 0, 4],
            [index_1.NodeTypes.ELEMENT_NODE],
            [index_1.NodeTypes.TEXT_NODE, 6, 11],
        ],
    },
    {
        desc: "text followed by an element that's self-closing element without a name </> ...actually indistinguishable from a closing tag without a name </> but we'll treat it as an element that's self-closing (with distinct .length === 1 so you can tell these apart... and if you want to ignore the open and just consider it a close you can ignore it)",
        xml: "text</>",
        lex: [
            [index_1.NodeTypes.TEXT_NODE, 0, 4],
            [index_1.NodeTypes.ELEMENT_NODE],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
    {
        desc: "the tag has no name self-closing followed by text",
        xml: "text</>text",
        lex: [
            [index_1.NodeTypes.TEXT_NODE, 0, 4],
            [index_1.NodeTypes.ELEMENT_NODE],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.TEXT_NODE, 7, 12],
        ],
    },
    {
        desc: "the tag has no name self-closing followed by text",
        xml: "text< />text",
        lex: [
            [index_1.NodeTypes.TEXT_NODE, 0, 4],
            [index_1.NodeTypes.ELEMENT_NODE],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.TEXT_NODE, 8, 13],
        ],
    },
    {
        desc: "the tag has no name self-closing followed by text",
        xml: "text< attr/>text",
        lex: [
            [index_1.NodeTypes.TEXT_NODE, 0, 4],
            [index_1.NodeTypes.ELEMENT_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 6, 10],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.TEXT_NODE, 12, 17],
        ],
    },
    {
        desc: "the tag has no name and has an attribute with a slash and space at the end. the slash is removed to be consistant with parsing of < attr/> but we don't consider it a self-closing element. If you want slashes use quotemarks",
        xml: "text< attr/ >text",
        lex: [
            [index_1.NodeTypes.TEXT_NODE, 0, 4],
            [index_1.NodeTypes.ELEMENT_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 6, 10],
            [index_1.NodeTypes.TEXT_NODE, 13, 18],
        ],
    },
    {
        desc: "fish tags. note that </> is parsed as an open AND close with .length===1 so you can filter it",
        xml: "<></>",
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE],
            [index_1.NodeTypes.ELEMENT_NODE],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
    {
        desc: "the tag has no name and has an attribute with a slash and space at the end. the slash is removed to be consistant with parsing of < attr/> but we don't consider it a self-closing element. If you want slashes use quotemarks",
        xml: "text< doc></doc>text",
        lex: [
            [index_1.NodeTypes.TEXT_NODE, 0, 4],
            [index_1.NodeTypes.ELEMENT_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 6, 9],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.TEXT_NODE, 16, 21],
        ],
    },
    {
        desc: "declaration",
        xml: "<?xml?>",
        lex: [[index_1.NodeTypes.XML_DECLARATION, 2, 5]],
    },
    {
        desc: "declaration with space",
        xml: "<?xml ?>",
        lex: [[index_1.NodeTypes.XML_DECLARATION, 2, 5]],
    },
    {
        desc: "declaration with non-wellformed closing",
        xml: "<?xml>",
        lex: [[index_1.NodeTypes.XML_DECLARATION, 2, 5]],
    },
    {
        desc: "processing instruction",
        xml: "<?xml-?>",
        lex: [[index_1.NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 6]],
    },
    {
        desc: "declaration with attributes",
        xml: '<?xml version="1.0"?>',
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
        ],
    },
    {
        desc: "declaration with attribute following whitespace",
        xml: '<?xml version="1.0" ?>',
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
        ],
    },
    {
        desc: "declaration with attribute single quotes",
        xml: "<?xml version='1.0'?>",
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
        ],
    },
    {
        desc: "declaration with attribute single quotes value has a > in it",
        xml: "<doc att='2>1'/>",
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 4],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 5, 8, 10, 13],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
    {
        desc: "declaration with two attributes",
        xml: "<?xml version='1.0' lang=\"en\"    ?>",
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 20, 24, 26, 28],
        ],
    },
    {
        desc: "declaration with two attributes close together",
        xml: "<?xml version='1.0'lang=\"en\"     ?>",
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 19, 23, 25, 27],
        ],
    },
    {
        desc: "Processing instruction with attribute",
        xml: '<?xml-stylesheet href="1.0"?>',
        lex: [
            [index_1.NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 17, 21, 23, 26],
        ],
    },
    {
        desc: "Processing instruction with valueless attribute",
        xml: "<?xml-stylesheet href?>",
        lex: [
            [index_1.NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 17, 21],
        ],
    },
    {
        desc: "Processing instruction with valueless attribute followed by regular attribute",
        xml: "<?xml-stylesheet href yahoo='serious'?>",
        lex: [
            [index_1.NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 17, 21],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 22, 27, 29, 36],
        ],
    },
    {
        desc: "Processing instruction with valueless attribute followed by regular attribute without speechmarks",
        xml: "<?xml-stylesheet href yahoo=serious?>",
        lex: [
            [index_1.NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 17, 21],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 22, 27, 28, 35],
        ],
    },
    {
        desc: "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing",
        xml: "<?xml-stylesheet href yahoo=serious>",
        lex: [
            [index_1.NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 17, 21],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 22, 27, 28, 35],
        ],
    },
    {
        desc: "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name",
        xml: "<?xml-stylesheet href yahoo=serious x>",
        lex: [
            [index_1.NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 17, 21],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 22, 27, 28, 35],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 36, 37],
        ],
    },
    {
        desc: "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name",
        xml: "<?xml-stylesheet href xx>",
        lex: [
            [index_1.NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 17, 21],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 22, 24],
        ],
    },
    {
        desc: "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing followed by valueless name and a space",
        xml: "<?xml-stylesheet href xx >",
        lex: [
            [index_1.NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 17, 21],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 22, 24],
        ],
    },
    {
        desc: "declaration and self-closing element",
        xml: "<?xml?><a/>",
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ELEMENT_NODE, 8, 9],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
    {
        desc: "declaration and element",
        xml: "<?xml?><a>",
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ELEMENT_NODE, 8, 9],
        ],
    },
    {
        desc: "declaration and two elements",
        xml: "<?xml?><a><b>",
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ELEMENT_NODE, 8, 9],
            [index_1.NodeTypes.ELEMENT_NODE, 11, 12],
        ],
    },
    {
        desc: "declaration and two elements (one self-closing)",
        xml: "<?xml?><a/><b>",
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ELEMENT_NODE, 8, 9],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.ELEMENT_NODE, 12, 13],
        ],
    },
    {
        desc: "declaration and two elements (one closing)",
        xml: "<?xml?><a></a><b>",
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ELEMENT_NODE, 8, 9],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.ELEMENT_NODE, 15, 16],
        ],
    },
    {
        desc: "declaration and two elements (one self-closing)",
        xml: "<?xml?><a></a><b/>",
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ELEMENT_NODE, 8, 9],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.ELEMENT_NODE, 15, 16],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
    {
        desc: "element followed by text",
        xml: "<a>text",
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 2],
            [index_1.NodeTypes.TEXT_NODE, 3, 8],
        ],
    },
    {
        desc: "element surrounded by text",
        xml: " <a>text",
        lex: [
            [index_1.NodeTypes.TEXT_NODE, 0, 1],
            [index_1.NodeTypes.ELEMENT_NODE, 2, 3],
            [index_1.NodeTypes.TEXT_NODE, 4, 9],
        ],
    },
    {
        desc: "comment",
        xml: "<!-- test -->",
        lex: [[index_1.NodeTypes.COMMENT_NODE, 4, 10]],
    },
    {
        desc: "comment with text before",
        xml: "a<!-- test -->",
        lex: [
            [index_1.NodeTypes.TEXT_NODE, 0, 1],
            [index_1.NodeTypes.COMMENT_NODE, 5, 11],
        ],
    },
    {
        desc: "comment with text before and after",
        xml: "a<!-- test -->b",
        lex: [
            [index_1.NodeTypes.TEXT_NODE, 0, 1],
            [index_1.NodeTypes.COMMENT_NODE, 5, 11],
            [index_1.NodeTypes.TEXT_NODE, 14, 16],
        ],
    },
    {
        desc: "self-closing element",
        xml: "<a/>",
        lex: [[index_1.NodeTypes.ELEMENT_NODE, 1, 2], [index_1.NodeTypes.CLOSE_ELEMENT]],
    },
    {
        desc: "non-self-closing element",
        xml: "<a>",
        lex: [[index_1.NodeTypes.ELEMENT_NODE, 1, 2]],
    },
    {
        desc: "nested elements",
        xml: "<a><b/></a>",
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 2],
            [index_1.NodeTypes.ELEMENT_NODE, 4, 5],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
    {
        desc: "declaration and elements",
        xml: "<?xml?><a><b/></a>",
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ELEMENT_NODE, 8, 9],
            [index_1.NodeTypes.ELEMENT_NODE, 11, 12],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
    {
        desc: "declaration and elements with attributes",
        xml: "<?xml?><a href='http://html5zombo.com'><b/></a>",
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ELEMENT_NODE, 8, 9],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 10, 14, 16, 37],
            [index_1.NodeTypes.ELEMENT_NODE, 40, 41],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
    {
        desc: "declaration with weird self-closing",
        xml: "<?xml/>",
        lex: [[index_1.NodeTypes.XML_DECLARATION, 2, 5], [index_1.NodeTypes.CLOSE_ELEMENT]],
    },
    {
        desc: "Doctype",
        xml: `<!DOCTYPE html PUBLIC
    "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`,
        lex: [
            [index_1.NodeTypes.DOCUMENT_TYPE_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 10, 14],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 15, 21],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 27, 65],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 72, 127],
        ],
    },
    {
        desc: "Doctype followed by text",
        xml: `<!DOCTYPE html PUBLIC
    "-//W3C//DTD XHTML 1.0 Transitional//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">ab`,
        lex: [
            [index_1.NodeTypes.DOCUMENT_TYPE_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 10, 14],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 15, 21],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 27, 65],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 72, 127],
            [index_1.NodeTypes.TEXT_NODE, 129, 132],
        ],
    },
    {
        desc: "HTML5 followed by html root tag",
        xml: `<!DOCTYPE html><html>`,
        lex: [
            [index_1.NodeTypes.DOCUMENT_TYPE_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 10, 14],
            [index_1.NodeTypes.ELEMENT_NODE, 16, 20],
        ],
    },
    {
        desc: "CDATA Section",
        xml: `<![CDATA[ \t <foo></bar> \t ]]>`,
        lex: [[index_1.NodeTypes.CDATA_SECTION_NODE, 9, 26]],
    },
    {
        desc: "CDATA Section followed by text",
        xml: `<![CDATA[ \t <foo></bar> \t ]]>abc`,
        lex: [
            [index_1.NodeTypes.CDATA_SECTION_NODE, 9, 26],
            [index_1.NodeTypes.TEXT_NODE, 29, 33],
        ],
    },
    {
        desc: "Entity",
        xml: `<!ENTITY entityname "replacement text">`,
        lex: [
            [index_1.NodeTypes.ENTITY_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 9, 19],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 21, 37],
        ],
    },
    {
        desc: "Entity followed by text",
        xml: `<!ENTITY entityname "replacement text">a`,
        lex: [
            [index_1.NodeTypes.ENTITY_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 9, 19],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 21, 37],
            [index_1.NodeTypes.TEXT_NODE, 39, 41],
        ],
    },
    {
        desc: "Doctype with entity definitions, followed by element with an entity in text node",
        xml: `<!DOCTYPE y [
     <!ENTITY % b '&#37;c;'>
     <!ENTITY % c '&#60;!ENTITY a "x" >'>
     %b;
    ]>
    <y>&nbsp;</y>`,
        lex: [
            [index_1.NodeTypes.DOCUMENT_TYPE_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 10, 11],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 12, 99],
            [index_1.NodeTypes.TEXT_NODE, 100, 105],
            [index_1.NodeTypes.ELEMENT_NODE, 106, 107],
            [index_1.NodeTypes.TEXT_NODE, 108, 114],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
    {
        desc: "Notation element followed by text",
        xml: `<!NOTATION name identifier "helper" >a`,
        lex: [
            [index_1.NodeTypes.NOTATION_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 11, 15],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 16, 26],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 28, 34],
            [index_1.NodeTypes.TEXT_NODE, 37, 39],
        ],
    },
    {
        desc: "Weird <[ ... ]> syntax (maybe shorthand CDATA?) I once saw",
        xml: `<[a<b></a>]>a`,
        lex: [
            [index_1.NodeTypes.CDATA_SECTION_NODE, 2, 10],
            [index_1.NodeTypes.TEXT_NODE, 12, 14],
        ],
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
            [index_1.NodeTypes.DOCUMENT_TYPE_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 10, 14],
            [index_1.NodeTypes.TEXT_NODE, 15, 18],
            [index_1.NodeTypes.ELEMENT_NODE, 19, 23],
            [index_1.NodeTypes.TEXT_NODE, 24, 27],
            [index_1.NodeTypes.ELEMENT_NODE, 28, 32],
            [index_1.NodeTypes.TEXT_NODE, 33, 36],
            [index_1.NodeTypes.ELEMENT_NODE, 37, 41],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 42, 49, 51, 56],
            [index_1.NodeTypes.TEXT_NODE, 58, 61],
            [index_1.NodeTypes.ELEMENT_NODE, 62, 67],
            [index_1.NodeTypes.TEXT_NODE, 68, 89],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.TEXT_NODE, 97, 100],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.TEXT_NODE, 107, 111],
            [index_1.NodeTypes.ELEMENT_NODE, 112, 116],
            [index_1.NodeTypes.TEXT_NODE, 117, 152],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.TEXT_NODE, 159, 163],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.TEXT_NODE, 170, 172],
        ],
    },
    {
        desc: "XHTML5 example with multiple file input",
        xml: `<!DOCTYPE html> <p><input type="file" multiple/></p> `,
        lex: [
            [index_1.NodeTypes.DOCUMENT_TYPE_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 10, 14],
            [index_1.NodeTypes.TEXT_NODE, 15, 16],
            [index_1.NodeTypes.ELEMENT_NODE, 17, 18],
            [index_1.NodeTypes.ELEMENT_NODE, 20, 25],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 26, 30, 32, 36],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 38, 46],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.TEXT_NODE, 52, 54],
        ],
    },
    {
        desc: "HTML5 equivalent of preceding example with self-closing <input>",
        xml: `<!DOCTYPE html> <p><input type="file" multiple></p> `,
        html: true,
        lex: [
            [index_1.NodeTypes.DOCUMENT_TYPE_NODE],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 10, 14],
            [index_1.NodeTypes.TEXT_NODE, 15, 16],
            [index_1.NodeTypes.ELEMENT_NODE, 17, 18],
            [index_1.NodeTypes.ELEMENT_NODE, 20, 25],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 26, 30, 32, 36],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 38, 46],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.TEXT_NODE, 51, 53],
        ],
    },
    {
        desc: "HTML5 self-closing tags without attributes",
        xml: `<br><img>`,
        html: true,
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 3],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.ELEMENT_NODE, 5, 8],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
    {
        desc: "HTML script tag followed by text that shouldn't be interpreted as closing tag",
        xml: `<script> var t="</closing>"; </script> `,
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 7],
            [index_1.NodeTypes.TEXT_NODE, 8, 29],
            [index_1.NodeTypes.CLOSE_ELEMENT],
            [index_1.NodeTypes.TEXT_NODE, 38, 40],
        ],
    },
    {
        desc: "Basic JSX attribute",
        xml: "<button onClick={this.element}>",
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 7],
            [index_1.NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 29],
        ],
    },
    {
        desc: "Basic JSX spread",
        xml: "<button {...obj}>",
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 7],
            [index_1.NodeTypes.JSX_ATTRIBUTE, 9, 15],
        ],
    },
    {
        desc: "JSX attribute with nesting",
        xml: `<button onClick={this.element.bind(this, () => { something(); }) }>a`,
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 7],
            [index_1.NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 65],
            [index_1.NodeTypes.TEXT_NODE, 67, 69],
        ],
    },
    {
        desc: "JSX attribute with nesting and strings",
        xml: `<button onClick={this.element.bind(this, () => { "123}}}"; something(); }) }>a`,
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 7],
            [index_1.NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 75],
            [index_1.NodeTypes.TEXT_NODE, 77, 79],
        ],
    },
    {
        desc: "JSX attribute with nesting and comments",
        xml: `<button onClick={this.element.bind(this, () => { // }}}}
    something(); }) }>a`,
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 7],
            [index_1.NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 77],
            [index_1.NodeTypes.TEXT_NODE, 79, 81],
        ],
    },
    {
        desc: "JSX attribute with nesting and multiline comments",
        xml: `<button onClick={this.element.bind(this, () => { /* }}}}
  }}
  */
    something(); }) }>a`,
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 7],
            [index_1.NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 87],
            [index_1.NodeTypes.TEXT_NODE, 89, 91],
        ],
    },
    {
        desc: "JSX attribute with malformed string with linebreak at end",
        xml: `<button onClick={this.element.bind(this, () => { const x = "test
    something(); }) }>a`,
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 7],
            [index_1.NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 85],
            [index_1.NodeTypes.TEXT_NODE, 87, 89],
        ],
    },
    {
        desc: "JSX attribute with template string and nested expression",
        xml: "<button onClick={this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }>a",
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 7],
            [index_1.NodeTypes.JSX_ATTRIBUTE, 8, 15, 17, 114],
            [index_1.NodeTypes.TEXT_NODE, 116, 118],
        ],
        jsx: true,
    },
    {
        desc: "JSX inline with template string and nested expression",
        xml: "<button>hello{this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }how are you?",
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 7],
            [index_1.NodeTypes.TEXT_NODE, 8, 13],
            [index_1.NodeTypes.JSX, 14, 111],
            [index_1.NodeTypes.TEXT_NODE, 112, 125],
        ],
        jsx: true,
    },
    {
        desc: "JSX example with JSX turned off",
        xml: "<button>hello{this.element.bind(this, () => { const x = `test${() => { /* ignored }}}} */ }}b` something(); }) }how are you?",
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 7],
            [index_1.NodeTypes.TEXT_NODE, 8, 125],
        ],
        jsx: false,
    },
    {
        desc: "Weird attribute name",
        xml: "<a xml::lang='b'/>",
        lex: [
            [index_1.NodeTypes.ELEMENT_NODE, 1, 2],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 3, 12, 14, 15],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
    {
        desc: "Declaration with empty attribute",
        xml: '<?xml version=""?><root></root>',
        lex: [
            [index_1.NodeTypes.XML_DECLARATION, 2, 5],
            [index_1.NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 15],
            [index_1.NodeTypes.ELEMENT_NODE, 19, 23],
            [index_1.NodeTypes.CLOSE_ELEMENT],
        ],
    },
];
test("lexes", () => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all(cases.map((eachCase, i) => {
        let result;
        try {
            result = (0, index_1.default)(eachCase.xml, {
                jsx: !!eachCase.jsx,
                html: !!eachCase.html,
            });
        }
        catch (e) {
            console.log(e);
            throw e;
        }
        if (!(0, lodash_1.isEqual)(result, eachCase.lex)) {
            console.log("Not equal");
            console.log(resolveNodesNumbers(eachCase.xml, result));
            console.log("after");
            try {
                result = (0, index_1.default)(eachCase.xml, {
                    jsx: !!eachCase.jsx,
                    html: !!eachCase.html,
                });
            }
            catch (e) { }
            if (result) {
                console.log("Result:", result, " from ", eachCase.xml);
                console.log(resolveNodes(eachCase.xml, result));
            }
        }
        else {
            // if (i === cases.length - 1) {
            //   console.log(resolveNodes(eachCase.xml, result));
            // }
        }
        expect(result).toEqual(eachCase.lex);
    }));
}));
test("Constants", () => __awaiter(void 0, void 0, void 0, function* () {
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
    ];
    expect(index_1.NodeTypeKeys).toEqual(keys);
    // @ts-ignore
    const testKeys = Object.keys(index_1.NodeTypes);
    testKeys.forEach((key) => {
        expect(index_1.NodeTypes[key]).toEqual(keys.indexOf(key));
    });
}));
