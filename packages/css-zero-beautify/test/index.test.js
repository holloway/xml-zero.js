import Beautify, { OUTPUT_FORMATS } from "../src/index";

var cases = [
  {
    desc: "a prop",
    css: "my prop",
    result: "my prop;"
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
