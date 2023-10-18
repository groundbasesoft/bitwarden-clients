import { MemoryStorageService } from "@bitwarden/common/platform/services/memory-storage.service";

import { MemoryStoragePortMessage } from "./port-messages";
import { portName } from "./port-name";

export class BackgroundMemoryStorageService extends MemoryStorageService {
  private _ports: chrome.runtime.Port[] = [];

  constructor() {
    super();

    chrome.runtime.onConnect.addListener((port) => {
      if (port.name !== portName(chrome.storage.session)) {
        return;
      }

      this._ports.push(port);
      port.onDisconnect.addListener(() => {
        this._ports.splice(this._ports.indexOf(port), 1);
      });
      port.onMessage.addListener(this.onMessageFromForeground.bind(this));
    });
    this.updates$.subscribe((update) => {
      this.sendMessage({
        action: "subject_update",
        data: JSON.stringify(update),
      });
    });
  }

  private async onMessageFromForeground(message: MemoryStoragePortMessage) {
    if (message.originator === "background") {
      return;
    }

    let result: unknown = null;

    switch (message.action) {
      case "get":
      case "getBypassCache":
      case "has": {
        result = await this[message.action](message.key);
        break;
      }
      case "save":
        await this.save(message.key, JSON.parse(message.data));
        break;
      case "remove":
        await this.remove(message.key);
        break;
    }

    this.sendMessage({
      id: message.id,
      key: message.key,
      data: JSON.stringify(result),
    });
  }

  private async sendMessage(data: Omit<MemoryStoragePortMessage, "originator">) {
    this._ports.forEach((port) => {
      port.postMessage({
        ...data,
        originator: "background",
      });
    });
  }
}
