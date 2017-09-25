import path from "path";
import DamageOf from "../src/index";
import { isEqual } from "lodash";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

const t = (filename: string) => path.join(__dirname, filename);

describe("DamageOf", async () =>
  test("Sleeper", async () => {
    const scripts = [t("sleeper.js")];
    const results = await DamageOf(scripts);
    expect(results.damages[0].duration).toBeGreaterThan(5);
    expect(results.damages[0].duration).toBeLessThan(7);
  }));
