import { MockProxy, mockDeep } from "jest-mock-extended";

import { BackgroundChromeStorageService } from "./background-chrome-storage.service";

describe("BackgroundChromeStorageService", () => {
  let sut: BackgroundChromeStorageService;
  const storage = chrome.storage.local;
  let port: MockProxy<chrome.runtime.Port>;

  beforeEach(() => {
    port = mockDeep();
    (chrome.runtime.connect as jest.Mock).mockReturnValue(port);
    sut = new BackgroundChromeStorageService(storage);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should open a port", () => {
    expect(chrome.runtime.connect).toHaveBeenCalledWith({ name: "local" });
    expect(sut["_port"]).toBe(port);
  });

  it("should listen to the port", () => {
    expect(port.onMessage.addListener).toHaveBeenCalledTimes(1);
  });

  describe("listener", () => {
    let methodUnderTest: (message: {
      id: string;
      key: string;
      action: "get" | "has";
      originator: "foreground" | "background";
    }) => Promise<void>;

    beforeEach(() => {
      methodUnderTest = (port.onMessage.addListener as jest.Mock).mock.calls[0][0];
    });

    it("should not respond to messages from the background", () => {
      methodUnderTest({
        id: "id",
        key: "key",
        action: "get",
        originator: "background",
      });

      expect(port.postMessage).toHaveBeenCalledTimes(0);
    });

    it.each(["get", "has"])(
      "should respond with the result of %s",
      async (action: "get" | "has") => {
        const id = "id";
        const key = "key";
        const value = "value";
        const jsonValue = JSON.stringify(value);
        const expectedMessage = {
          id: id,
          key: key,
          data: jsonValue,
        };

        (sut as any)[action] = jest.fn().mockResolvedValue(value);

        await methodUnderTest({
          id: id,
          key: key,
          action: action,
          originator: "foreground",
        });

        expect(port.postMessage).toHaveBeenCalledWith(expectedMessage);
      }
    );
  });
});
