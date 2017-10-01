import path from "path";
import DamageOf from "../src/index";
import { isEqual } from "lodash";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

const fullPath = (filename: string) => path.resolve(__dirname, filename);

describe("DamageOf", async () =>
  test("Sleeper", async () => {
    const damages = await DamageOf([fullPath("./sleeper.js")], { repeat: 10 });
    console.log(JSON.stringify(damages, null, 2));
    expect(damages[0].time.mean).toBeGreaterThan(5);
    expect(damages[0].time.mean).toBeLessThan(7);
  }));
