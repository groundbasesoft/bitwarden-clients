import { BackgroundChromeStorageService } from "./background-chrome-storage.service";
import { ForegroundChromeStorageService } from "./foreground-chrome-storage.service";
import { mockPort } from "./mock-port.spec-util";
import { portName } from "./port-name";

describe("foreground background chrome storage interaction", () => {
  let foreground: ForegroundChromeStorageService;
  let background: BackgroundChromeStorageService;
  const storageArea = chrome.storage.local;

  beforeEach(() => {
    mockPort(portName(storageArea));

    background = new BackgroundChromeStorageService(storageArea);
    foreground = new ForegroundChromeStorageService(storageArea);
  });

  afterEach(() => {
    jest.resetAllMocks();
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
