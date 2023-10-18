import { mockDeep } from "jest-mock-extended";

export function mockPort() {
  const port = mockDeep<chrome.runtime.Port>();
  (port.postMessage as jest.Mock).mockImplementation((message) => {
    (port.onMessage.addListener as jest.Mock).mock.calls.forEach(([callbackFn]) => {
      callbackFn(message);
    });
  });
  return port;
}
