import { mockDeep } from "jest-mock-extended";

/**
 * Mocks a chrome.runtime.Port set up to send messages through `postMessage` to `onMessage.addListener` callbacks.
 * @returns a mock chrome.runtime.Port
 */
export function mockPort() {
  const port = mockDeep<chrome.runtime.Port>();
  (port.postMessage as jest.Mock).mockImplementation((message) => {
    (port.onMessage.addListener as jest.Mock).mock.calls.forEach(([callbackFn]) => {
      callbackFn(message);
    });
  });
  return port;
}
