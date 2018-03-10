import Beautify, { OUTPUT_FORMATS } from "../src/index";

var cases = [
  {
    desc: "a prop",
    css: "my prop",
    beautified: "my prop"
  },
  {
    desc: "comment with whitespace",
    css: "/* comment */    ",
    beautified: "/* comment */"
  },
  {
    desc: "comment with whitespace before and after",
    css: "    /* comment */    ",
    beautified: "/* comment */"
  },
  {
    desc: "a prop and a comment",
    css: "my prop/* comment */",
    beautified: "my prop/* comment */"
  },
  {
    desc: "a prop",
    css: "my prop/* comment */;",
    beautified: "my prop/* comment */;\n"
  },
  {
    desc: "a prop",
    css: "my prop/* comment */{ prop }",
    beautified: "my prop/* comment */ {\n  prop;\n}\n"
  },
  {
    desc: "property and comment and property",
    css: "prop/*comment*/text", // we can't insert whitespace because afaik it might affect how props are concated. TODO: confirm if this is true
    beautified: "prop/*comment*/text"
  },
  {
    desc: "comment and whitespace and property",
    css: "/*comment*/ text",
    beautified: "/*comment*/text"
  },
  {
    desc: "whitespace, comment, property",
    css: " /*comment*/ text",
    beautified: "/*comment*/text"
  },
  {
    desc: "Whitespace, property, comment",
    css: " text /*comment*/",
    beautified: "text/*comment*/"
  },
  {
    desc: "Property, whitespace, then comment then whitespace",
    css: " text /*comment*/ ",
    beautified: "text/*comment*/"
  },
  {
    desc: "whitespace, one property",
    css: " text;",
    beautified: "text;\n"
  },
  {
    desc: "Whitespace then two properties",
    css: " text; text;",
    beautified: "text;\ntext;\n"
  },
  {
    desc: "Two properties with whitespace",
    css: " text; text; ",
    beautified: "text;\ntext;\n"
  },
  {
    desc: "One property, one selector",
    css: " text; text{",
    beautified: "text;\ntext {\n"
  },
  {
    desc: "Two properties, the second has a comment in the middle",
    css: " text; te/* comment */xt",
    beautified: "text;\nte/* comment */xt"
  },
  {
    desc: "Whitespace, one property, one selector",
    css: " text; text{}",
    beautified: "text;\ntext {\n}\n"
  },
  {
    desc: "Whitespace, comment, whitespace, and two properties",
    css: " /*comment*/ text; text;",
    beautified: "/*comment*/text;\ntext;\n"
  },
  {
    desc: "Comment with property",
    css: "/* comment */text",
    beautified: "/* comment */text"
  },
  {
    desc: "Selector with property with ;",
    css: "text {     prop;  }  ",
    beautified: "text {\n  prop;\n}\n"
  },
  {
    desc: "Selector with property without ;",
    css: "text { prop }",
    beautified: "text {\n  prop;\n}\n"
  },
  {
    desc: "Selector with properties",
    css: "text { prop; prop2: value }",
    beautified: "text {\n  prop;\n  prop2: value;\n}\n"
  },
  {
    desc: "Sass nested properties",
    css: "text { prop; prop2 { value } }",
    beautified: "text {\n  prop;\n  prop2 {\n    value;\n  }\n}\n"
  },
  {
    desc: "CSS comma selectors",
    css: "text selector1, text selector2 { prop; prop2 { value } }",
    beautified:
      "text selector1,\ntext selector2 {\n  prop;\n  prop2 {\n    value;\n  }\n}\n"
  },
  {
    desc: "CSS comma selectors with comment",
    css:
      "text selector1, text selector2 { prop; prop2 { value } /* comment */ }",
    beautified:
      "text selector1,\ntext selector2 {\n  prop;\n  prop2 {\n    value;\n  }\n  /* comment */\n}\n"
  },
  {
    desc: "CSS comma selectors with comment",
    css:
      "text selector1, text selector2 { prop; prop2 { value } /* comment */ }",
    output: "html",
    beautified:
      '<span class="b-selector">text selector1</span><span class="b-comma">,</span><br/>\n<span class="b-selector">text selector2</span> <span class="b-open-rule">{</span><br/>\n &nbsp;<span class="b-prop">prop</span><span class="b-prop-close">;</span><br/>\n &nbsp;<span class="b-selector">prop2</span> <span class="b-open-rule">{</span><br/>\n &nbsp; &nbsp;<span class="b-prop">value</span><span class="b-prop-close">;</span><br/>\n &nbsp;<span class="b-close-rule">}</span><br/>\n &nbsp;<span class="b-comment">/* comment */</span><br/>\n<span class="b-close-rule">}</span><br/>\n'
  },
  {
    desc: "Testing escaping chars",
    css: "text > selector1 { prop; }",
    output: "html",
    beautified:
      '<span class="b-selector">text &gt; selector1</span> <span class="b-open-rule">{</span><br/>\n &nbsp;<span class="b-prop">prop</span><span class="b-prop-close">;</span><br/>\n<span class="b-close-rule">}</span><br/>\n'
  }
];

describe("lexes", async () =>
  cases.forEach((eachCase, i) => {
    test(`${eachCase.desc} ${eachCase.css.replace(/\n/g, "\\n")}`, async () => {
      let result;
      try {
        const options = {};
        if (eachCase.output) {
          options.output = eachCase.output;
        }
        if (eachCase.outputHtmlClassPrefix) {
          options.outputHtmlClassPrefix = eachCase.outputHtmlClassPrefix;
        }
        result = Beautify(eachCase.css, options);
      } catch (e) {
        console.log(e);
      }
      expect(result).toEqual(eachCase.beautified);
    });
  }));
