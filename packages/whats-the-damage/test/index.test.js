import path from "path";
import DamageOf from "../src/index";
import { isEqual } from "lodash";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

const t = (filename: string) => path.join(__dirname, filename);

describe("DamageOf", async () =>
  test("Sleeper", async () => {
    const scripts = [t("sleeper.js"), t("sleeper.js")];
    const results = await DamageOf(scripts);

    console.log(JSON.stringify(results, null, 2));
    expect(results.damages[0].time.mean).toBeGreaterThan(5);
    expect(results.damages[0].time.mean).toBeLessThan(7);
  }));
