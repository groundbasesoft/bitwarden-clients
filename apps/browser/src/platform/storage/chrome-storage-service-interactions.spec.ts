import { BackgroundChromeStorageService } from "./background-chrome-storage.service";
import { ForegroundChromeStorageService } from "./foreground-chrome-storage.service";
import { mockPort } from "./mock-port.spec-util";

describe("foreground background chrome storage interaction", () => {
  let foreground: ForegroundChromeStorageService;
  let background: BackgroundChromeStorageService;
  let port: chrome.runtime.Port;
  const storageArea = chrome.storage.local;

  beforeEach(() => {
    port = mockPort();

    chrome.runtime.connect = jest.fn().mockReturnValue(port);

    foreground = new ForegroundChromeStorageService(storageArea);
    background = new BackgroundChromeStorageService(storageArea);
  });

  test.each(["has", "get"])(
    "background should respond with the correct value for %s",
    async (action: "get" | "has") => {
      const key = "key";
      const value = "value";
      background[action] = jest.fn().mockResolvedValue(value);

      const result = await foreground[action](key);
      expect(result).toEqual(value);
    }
  );
});
