import { Observable, filter, firstValueFrom, map } from "rxjs";

import { Utils } from "@bitwarden/common/platform/misc/utils";

import { fromChromeEvent } from "../browser/from-chrome-event";
import AbstractChromeStorageService from "../services/abstractions/abstract-chrome-storage-api.service";

import { portName } from "./port-name";

/**
 * This class is used to ensure the background storage service is used as the source of truth for a given key.
 *
 * The read methods are overridden to proxy the request to the background service and wait for a response.
 * The write methods are unchanged since updates are alerted to all parties through the `onChanged` event.
 */
export class ForegroundChromeStorageService extends AbstractChromeStorageService {
  private _port: chrome.runtime.Port;
  private _backgroundResponses$: Observable<{ id: string; key: string; data: string }>;

  constructor(chromeStorageArea: chrome.storage.StorageArea) {
    super(chromeStorageArea);

    this._port = chrome.runtime.connect({ name: portName(chromeStorageArea) });
    this._backgroundResponses$ = fromChromeEvent(this._port.onMessage).pipe(
      map(([message]) => message)
    );
  }

  override async get<T>(key: string): Promise<T> {
    return await this.sendWithResponse<T>(key, "get");
  }

  override async has(key: string): Promise<boolean> {
    return await this.sendWithResponse<boolean>(key, "has");
  }

  private async sendWithResponse<T>(key: string, action: "get" | "has"): Promise<T> {
    const id = Utils.newGuid();
    // listen for response before request
    const response = firstValueFrom(
      this._backgroundResponses$.pipe(
        filter((message) => message.id === id),
        map((message) => JSON.parse(message.data) as T) // message data is jsonified
      )
    );

    this._port.postMessage({
      id: id,
      key: key,
      action: action,
      originator: "foreground",
    });

    return await response;
  }
}
