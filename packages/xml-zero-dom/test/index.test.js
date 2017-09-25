import DOM from "../src/index";
import { get } from "lodash";

const html5 = `
  <!DOCTYPE html>
  <html lang="en" html5>
  <head>
  <meta charset="UTF-8">
  <title>Title of the document</title>
  </head>

  <body>
  Content of the document......
  </body>

  </html>
  <script src="some proxy inserted tracker.js"></script>`;

var cases = [
  {
    desc: "HTML5 example",
    xml: html5,
    property: "documentElement.name",
    result: "html"
  },
  {
    desc: "HTML5 example",
    xml: html5,
    property: "documentElement.getAttribute",
    arguments: ["lang"],
    result: "en"
  },
  {
    desc: "HTML5 example",
    xml: html5,
    property: "documentElement.getAttribute",
    arguments: ["html5"],
    result: true
  },
  {
    desc: "HTML5 example",
    xml: html5,
    property: "documentElements",
    result: []
  }
];

describe("lexes", async () =>
  cases.forEach((eachCase, i) => {
    test(`${eachCase.desc} ${eachCase.xml.replace(
      /[\r\n]/g,
      ""
    )}`, async () => {
      let dom;
      dom = new DOM(eachCase.xml);
      let result = get(dom, eachCase.property);
      if (eachCase.arguments) {
        // result is a function
        result = result(...eachCase.arguments);
      }
      expect(result).toEqual(eachCase.result);
    });
  }));
