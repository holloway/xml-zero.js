import Lex, { NodeTypes, resolveNodes } from "./lexer";
import { isEqual } from "lodash";

var cases = [
  // This variable forked from xml.js https://github.com/nashwaan/xml-js under the MIT licence
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
  }
  //   {
  //     desc: "processing instruction <?go there>",
  //     xml: "<?go there?>",
  //   },
  //   {
  //     desc: "should convert comment",
  //     xml: "<!-- \t Hello, World! \t -->",
  //     js1: { _comment: " \t Hello, World! \t " },
  //     js2: { elements: [{ type: "comment", comment: " \t Hello, World! \t " }] }
  //   },
  //   {
  //     desc: "should convert 2 comments",
  //     xml: "<!-- \t Hello \t -->\n<!-- \t World \t -->",
  //     js1: { _comment: [" \t Hello \t ", " \t World \t "] },
  //     js2: {
  //       elements: [
  //         { type: "comment", comment: " \t Hello \t " },
  //         { type: "comment", comment: " \t World \t " }
  //       ]
  //     }
  //   },
  //   {
  //     desc: "should convert cdata",
  //     xml: "<![CDATA[ \t <foo></bar> \t ]]>",
  //     js1: { _cdata: " \t <foo></bar> \t " },
  //     js2: { elements: [{ type: "cdata", cdata: " \t <foo></bar> \t " }] }
  //   },
  //   {
  //     desc: "should convert 2 cdata",
  //     xml: '<![CDATA[ \t data]]><![CDATA[< > " and & \t ]]>',
  //     js1: { _cdata: [" \t data", '< > " and & \t '] },
  //     js2: {
  //       elements: [
  //         { type: "cdata", cdata: " \t data" },
  //         { type: "cdata", cdata: '< > " and & \t ' }
  //       ]
  //     }
  //   },
  //   {
  //     desc: "should convert doctype",
  //     xml: '<!DOCTYPE note [\n<!ENTITY foo "baa">]>',
  //     js1: { _doctype: 'note [\n<!ENTITY foo "baa">]' },
  //     js2: {
  //       elements: [{ type: "doctype", doctype: 'note [\n<!ENTITY foo "baa">]' }]
  //     }
  //   },
  //   {
  //     desc: "should convert element",
  //     xml: "<a/>",
  //     js1: { a: {} },
  //     js2: { elements: [{ type: "element", name: "a" }] }
  //   },
  //   {
  //     desc: "should convert 2 same elements",
  //     xml: "<a/>\n<a/>",
  //     js1: { a: [{}, {}] },
  //     js2: {
  //       elements: [{ type: "element", name: "a" }, { type: "element", name: "a" }]
  //     }
  //   },
  //   {
  //     desc: "should convert 2 different elements",
  //     xml: "<a/>\n<b/>",
  //     js1: { a: {}, b: {} },
  //     js2: {
  //       elements: [{ type: "element", name: "a" }, { type: "element", name: "b" }]
  //     }
  //   },
  //   {
  //     desc: "should convert attribute",
  //     xml: '<a x="hello"/>',
  //     js1: { a: { _attributes: { x: "hello" } } },
  //     js2: {
  //       elements: [{ type: "element", name: "a", attributes: { x: "hello" } }]
  //     }
  //   },
  //   {
  //     desc: "should convert 2 attributes",
  //     xml: '<a x="1.234" y="It\'s"/>',
  //     js1: { a: { _attributes: { x: "1.234", y: "It's" } } },
  //     js2: {
  //       elements: [
  //         { type: "element", name: "a", attributes: { x: "1.234", y: "It's" } }
  //       ]
  //     }
  //   },
  //   {
  //     desc: "should convert text in element",
  //     xml: "<a> \t Hi \t </a>",
  //     js1: { a: { _text: " \t Hi \t " } },
  //     js2: {
  //       elements: [
  //         {
  //           type: "element",
  //           name: "a",
  //           elements: [{ type: "text", text: " \t Hi \t " }]
  //         }
  //       ]
  //     }
  //   },
  //   {
  //     desc: "should convert multi-line text",
  //     xml: "<a>  Hi \n There \t </a>",
  //     js1: { a: { _text: "  Hi \n There \t " } },
  //     js2: {
  //       elements: [
  //         {
  //           type: "element",
  //           name: "a",
  //           elements: [{ type: "text", text: "  Hi \n There \t " }]
  //         }
  //       ]
  //     }
  //   },
  //   {
  //     desc: "should convert nested elements",
  //     xml: "<a>\n\v<b/>\n</a>",
  //     js1: { a: { b: {} } },
  //     js2: {
  //       elements: [
  //         {
  //           type: "element",
  //           name: "a",
  //           elements: [{ type: "element", name: "b" }]
  //         }
  //       ]
  //     }
  //   },
  //   {
  //     desc: "should convert 3 nested elements",
  //     xml: "<a>\n\v<b>\n\v\v<c/>\n\v</b>\n</a>",
  //     js1: { a: { b: { c: {} } } },
  //     js2: {
  //       elements: [
  //         {
  //           type: "element",
  //           name: "a",
  //           elements: [
  //             {
  //               type: "element",
  //               name: "b",
  //               elements: [{ type: "element", name: "c" }]
  //             }
  //           ]
  //         }
  //       ]
  //     }
  //   }
];

describe("lexes", async () =>
  cases.forEach(eachCase => {
    test(`${eachCase.desc} ${eachCase.xml}`, async () => {
      let result;
      try {
        result = await Lex(eachCase.xml);
      } catch (e) {}

      console.log(resolveNodes(eachCase.xml, result));

      if (!isEqual(result, eachCase.lex)) {
        console.log("Not equal");
        try {
          result = await Lex(eachCase.xml, true);
        } catch (e) {}
        if (result) {
          console.log(
            "Result:",
            resolveNodes(eachCase.xml, result),
            " from",
            eachCase.xml
          );
        }
      }

      expect(result).toEqual(eachCase.lex);
    });
  }));
