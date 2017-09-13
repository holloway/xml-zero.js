import DOM from "../src/index";
import isEqual from "lodash";

var cases = [
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

  </html> `
  }
];

describe("lexes", async () =>
  cases.forEach((eachCase, i) => {
    test(`${eachCase.desc} ${eachCase.xml}`, async () => {
      let dom;
      dom = new DOM(eachCase.xml);

      const result = dom.documentElement; // dom.toString();

      console.log("RESULT", result);

      expect(result).toEqual(eachCase.lex);
    });
  }));
