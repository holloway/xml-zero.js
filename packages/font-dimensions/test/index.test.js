import { charsetLength, CHARSET, TO } from "../src/index";

describe("charset", async () => {
  test('range', async () => {
    const length = await charsetLength([0, TO, 10]);
    expect(length).toEqual(11);
  });
  test('nz', async () => {
    const length = await charsetLength(CHARSET.NZ);
    expect(length).toEqual(125);
  })
});
