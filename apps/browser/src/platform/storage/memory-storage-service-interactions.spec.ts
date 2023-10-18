import { trackEmissions } from "@bitwarden/common/../spec/utils";

import { BackgroundMemoryStorageService } from "./background-memory-storage.service";
import { ForegroundMemoryStorageService } from "./foreground-memory-storage.service";
import { mockPort } from "./mock-port.spec-util";

describe("foreground background memory storage interaction", () => {
  let foreground: ForegroundMemoryStorageService;
  let background: BackgroundMemoryStorageService;
  let port: chrome.runtime.Port;

  beforeEach(() => {
    port = mockPort();

    chrome.runtime.connect = jest.fn().mockReturnValue(port);

    foreground = new ForegroundMemoryStorageService();
    background = new BackgroundMemoryStorageService();
  });

  test.each(["has", "get", "getBypassCache"])(
    "background should respond with the correct value for %s",
    async (action: "get" | "has" | "getBypassCache") => {
      const key = "key";
      const value = "value";
      background[action] = jest.fn().mockResolvedValue(value);

      const result = await foreground[action](key);
      expect(result).toEqual(value);
    }
  );

  test("background should call save from foreground", async () => {
    const key = "key";
    const value = "value";
    const actionSpy = jest.spyOn(background, "save");
    await foreground.save(key, value);

    expect(actionSpy).toHaveBeenCalledWith(key, value);
  });

  test("background should call remove from foreground", async () => {
    const key = "key";
    const actionSpy = jest.spyOn(background, "remove");
    await foreground.remove(key);

    expect(actionSpy).toHaveBeenCalledWith(key);
  });

  test("background updates push to foreground", async () => {
    const key = "key";
    const value = "value";
    const updateType = "save";
    const emissions = trackEmissions(foreground.updates$);
    await background.save(key, value);

    expect(emissions).toEqual([{ key, value, updateType }]);
  });
});
