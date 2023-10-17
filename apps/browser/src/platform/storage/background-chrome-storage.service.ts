import AbstractChromeStorageService from "../services/abstractions/abstract-chrome-storage-api.service";

import { portName } from "./port-name";

export class BackgroundChromeStorageService extends AbstractChromeStorageService {
  private _port: chrome.runtime.Port;

  constructor(chromeStorageArea: chrome.storage.StorageArea) {
    super(chromeStorageArea);

    this._port = chrome.runtime.connect({ name: portName(chromeStorageArea) });
    this._port.onMessage.addListener(this.onMessageFromForeground.bind(this));
  }

  private async onMessageFromForeground(message: {
    id: string;
    key: string;
    action: "get" | "has";
    originator: "foreground" | "background";
  }) {
    if (message.originator === "background") {
      return;
    }

    const response = await this[message.action](message.key);
    this._port.postMessage({
      id: message.id,
      key: message.key,
      data: JSON.stringify(response),
    });
  }
}
