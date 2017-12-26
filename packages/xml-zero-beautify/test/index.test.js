import Beautify from "../src/index";

var cases = [
  {
    desc: "Basic tags",
    xml: "<x>test</x>",
    jsx: false,
    beautified: "<x>\n  test\n</x>\n"
  },
  {
    desc: "HTML",
    xml: "<x><l>test</l></x>",
    jsx: false,
    beautified: "<x>\n  <l>\n    test\n  </l>\n</x>\n"
  }
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
