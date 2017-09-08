import Lex, { NodeTypes, resolveNodes } from "./lexer";
import { isEqual } from "lodash";

var cases = [
  // hoisted up
  // This variable forked from xml.js https://github.com/nashwaan/xml-js under the MIT licence
  {
    desc: "declaration",
    xml: "<?xml?>",
    lex: [[NodeTypes.XML_DECLARATION, 2, 5], [NodeTypes.CLOSE_NODE, 6, 7]]
  },
  {
    desc: "declaration with space",
    xml: "<?xml ?>",
    lex: [[NodeTypes.XML_DECLARATION, 2, 5], [NodeTypes.CLOSE_NODE, 7, 8]]
  },
  {
    desc: "declaration with non-wellformed closing",
    xml: "<?xml>",
    lex: [[NodeTypes.XML_DECLARATION, 2, 5], [NodeTypes.CLOSE_NODE, 5, 6]]
  },
  {
    desc: "processing instruction",
    xml: "<?xml-?>",
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 6],
      [NodeTypes.CLOSE_NODE, 7, 8]
    ]
  },
  {
    desc: "declaration with attributes",
    xml: '<?xml version="1.0"?>',
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
      [NodeTypes.CLOSE_NODE, 20, 21]
    ]
  },
  {
    desc: "declaration with attribute following whitespace",
    xml: '<?xml version="1.0" ?>',
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
      [NodeTypes.CLOSE_NODE, 21, 22]
    ]
  },
  {
    desc: "declaration with attribute single quotes",
    xml: "<?xml version='1.0'?>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
      [NodeTypes.CLOSE_NODE, 20, 21]
    ]
  },
  {
    desc: "declaration with two attributes",
    xml: "<?xml version='1.0' lang=\"en\"    ?>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
      [NodeTypes.ATTRIBUTE_NODE, 20, 24, 26, 28],
      [NodeTypes.CLOSE_NODE, 34, 35]
    ]
  },
  {
    desc: "declaration with two attributes close together",
    xml: "<?xml version='1.0'lang=\"en\"     ?>",
    lex: [
      [NodeTypes.XML_DECLARATION, 2, 5],
      [NodeTypes.ATTRIBUTE_NODE, 6, 13, 15, 18],
      [NodeTypes.ATTRIBUTE_NODE, 19, 23, 25, 27],
      [NodeTypes.CLOSE_NODE, 34, 35]
    ]
  },
  {
    desc: "Processing instruction with attribute",
    xml: '<?xml-stylesheet href="1.0"?>',
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21, 23, 26],
      [NodeTypes.CLOSE_NODE, 28, 29]
    ]
  },
  {
    desc: "Processing instruction with valueless attribute",
    xml: "<?xml-stylesheet href?>",
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.CLOSE_NODE, 22, 23]
    ]
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute",
    xml: "<?xml-stylesheet href yahoo='serious'?>",
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 27, 29, 36],
      [NodeTypes.CLOSE_NODE, 38, 39]
    ]
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks",
    xml: "<?xml-stylesheet href yahoo=serious?>",
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 27, 28, 35],
      [NodeTypes.CLOSE_NODE, 36, 37]
    ]
  },
  {
    desc:
      "Processing instruction with valueless attribute followed by regular attribute without speechmarks malformed closing",
    xml: "<?xml-stylesheet href yahoo=serious>",
    lex: [
      [NodeTypes.PROCESSING_INSTRUCTION_NODE, 2, 16],
      [NodeTypes.ATTRIBUTE_NODE, 17, 21],
      [NodeTypes.ATTRIBUTE_NODE, 22, 27, 28, 35],
      [NodeTypes.CLOSE_NODE, 35, 36]
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
      [NodeTypes.ATTRIBUTE_NODE, 36, 37],
      [NodeTypes.CLOSE_NODE, 37, 38]
    ]
  }

  // {
  //   desc: "Processing instruction with two attributes",
  //   xml: '<?xml-stylesheet href="1.0"yahoo="serious"?>',
  //   lex: [
  //     [NodeTypes.XML_DECLARATION, 2, 5],
  //     [NodeTypes.ATTRIBUTE_NODE, 17, 21, 23, 26],
  //     [NodeTypes.ATTRIBUTE_NODE, 19, 23, 25, 27],
  //     [NodeTypes.CLOSE_NODE, 34, 35]
  //   ]
  // }

  //   {
  //     desc: "declaration and element",
  //     xml: "<?xml?>\n<a/>",
  //     js1: { _declaration: {}, a: {} },
  //     js2: { declaration: {}, elements: [{ type: "element", name: "a" }] }
  //   },
  //   {
  //     desc: "declaration and elements",
  //     xml: "<?xml?>\n<a>\n\v<b/>\n</a>",
  //     js1: { _declaration: {}, a: { b: {} } },
  //     js2: {
  //       declaration: {},
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
  //     desc: "processing instruction <?go there>",
  //     xml: "<?go there?>",
  //     js1: { _instruction: { go: "there" } },
  //     js2: {
  //       elements: [{ type: "instruction", name: "go", instruction: "there" }]
  //     }
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
      const result = await Lex(eachCase.xml);

      console.log(
        "Result:",
        resolveNodes(eachCase.xml, result),
        " from",
        eachCase.xml
      );
      expect(result).toEqual(eachCase.lex);
    });
  }));
