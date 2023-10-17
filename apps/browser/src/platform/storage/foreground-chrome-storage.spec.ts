import { MockProxy, mockDeep } from "jest-mock-extended";
import { Subject } from "rxjs";

import { fromChromeEvent } from "../browser/from-chrome-event";

import { ForegroundChromeStorageService } from "./foreground-chrome-storage.service";

jest.mock("../browser/from-chrome-event", () => {
  return {
    fromChromeEvent: jest.fn(),
  };
});
const fromChromeEventMock = fromChromeEvent as jest.Mock;

describe("ForegroundChromeStorage", () => {
  let sut: ForegroundChromeStorageService;
  const storage = chrome.storage.local;
  let port: MockProxy<chrome.runtime.Port>;
  let responseSubject: Subject<
    [
      {
        id: string;
        key: string;
        data: string;
        originator: "background";
      }
    ]
  >;

  beforeEach(() => {
    port = mockDeep();
    responseSubject = new Subject();
    fromChromeEventMock.mockReturnValue(responseSubject);
    (chrome.runtime.connect as jest.Mock).mockReturnValue(port);
    sut = new ForegroundChromeStorageService(storage);
  });

  afterEach(() => {
    jest.resetAllMocks();
    responseSubject.complete();
  });

  it("should connect to the background", () => {
    expect(chrome.runtime.connect).toHaveBeenCalledWith({ name: "local" });
    expect(sut["_port"]).toBe(port);
  });

  describe("method delegation", () => {
    const value = "value";
    const jsonValue = JSON.stringify(value);
    let messageSpy: jest.SpyInstance;

    beforeEach(() => {
      messageSpy = jest.spyOn(port, "postMessage");
    });

    it("should not listen to the port when not delegated", () => {
      expect(port.onMessage.addListener).toHaveBeenCalledTimes(0);
    });

    it.each(["get", "has"])(
      "should delegate `%s` to the background",
      async (method: "get" | "has") => {
        const actualPromise = sut[method]("key");
        const calledId = messageSpy.mock.calls[0][0].id;

        responseSubject.next([
          {
            id: calledId,
            key: "key",
            data: jsonValue,
            originator: "background",
          },
        ]);
        const actual = await actualPromise;

        expect(actual).toEqual(value);
      }
    );
  });
});
