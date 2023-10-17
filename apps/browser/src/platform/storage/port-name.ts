export function portName(chromeStorageArea: chrome.storage.StorageArea) {
  switch (chromeStorageArea) {
    case chrome.storage.local:
      return "local";
    case chrome.storage.sync:
      return "sync";
    case chrome.storage.managed:
      return "managed";
    case chrome.storage.session:
      return "session";
    default:
      throw new Error("Invalid chrome storage area");
  }
}
