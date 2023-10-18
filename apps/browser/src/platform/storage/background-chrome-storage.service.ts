import AbstractChromeStorageService from "../services/abstractions/abstract-chrome-storage-api.service";

import { portName } from "./port-name";

export class BackgroundChromeStorageService extends AbstractChromeStorageService {
  private _ports: chrome.runtime.Port[] = [];

  constructor(chromeStorageArea: chrome.storage.StorageArea) {
    super(chromeStorageArea);

    chrome.runtime.onConnect.addListener((port) => {
      if (port.name !== portName(chromeStorageArea)) {
        return;
      }

      this._ports.push(port);
      port.onDisconnect.addListener(() => {
        this._ports.splice(this._ports.indexOf(port), 1);
      });
      port.onMessage.addListener(this.onMessageFromForeground.bind(this));
    });
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
    this._ports.forEach((port) => {
      port.postMessage({
        id: message.id,
        key: message.key,
        data: response,
        originator: "background",
      });
    });
  }
}
