import { EventHandler } from "react";

import AutofillOverlayPort from "./port-identifiers.enum";

class AutofillOverlayCustomElementIframe extends HTMLElement {
  constructor(iframePath: string, portName: string) {
    super();

    const extensionUri = chrome.runtime.getURL("").slice(0, -1).toLowerCase();
    const iframe: HTMLIFrameElement = document.createElement("iframe");
    const shadow: ShadowRoot = this.attachShadow({ mode: "closed" });
    const handlersMemo: { [key: string]: EventHandler<any> } = {};
    appendIframeToShadowDom();

    function appendIframeToShadowDom() {
      iframe.src = chrome.runtime.getURL(iframePath);
      iframe.style.border = "none";
      iframe.style.background = "transparent";
      iframe.style.margin = "0";
      iframe.style.padding = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.addEventListener("load", setupPortMessageListener);

      shadow.appendChild(iframe);
    }

    function setupPortMessageListener() {
      const port = chrome.runtime.connect({ name: portName });
      port.onMessage.addListener(handlePortMessage);
      window.addEventListener("message", handleWindowMessage(port));
    }

    function handlePortMessage(message: any, port: chrome.runtime.Port) {
      if (port.name !== portName) {
        return;
      }

      iframe.contentWindow?.postMessage(message, "*");
    }

    function handleWindowMessage(port: chrome.runtime.Port): EventHandler<any> {
      const memoIndex = `${portName}MessageHandler`;
      return (
        handlersMemo[memoIndex] ||
        (handlersMemo[memoIndex] = (event: MessageEvent) => {
          if (
            event.source !== iframe.contentWindow ||
            !isFromExtensionOrigin(event.origin.toString().toLowerCase())
          ) {
            return;
          }

          port.postMessage(event.data);
        })
      );
    }

    function isFromExtensionOrigin(messageOrigin: string): boolean {
      // Chrome returns null for any sandboxed iframe sources.
      // Firefox references the extension URI as its origin.
      // Any other origin value is a security risk.
      return [extensionUri, "null"].includes(messageOrigin);
    }
  }
}

class AutofillOverlayIconIframe extends AutofillOverlayCustomElementIframe {
  constructor() {
    super("overlay/icon.html", AutofillOverlayPort.Icon);
  }
}

class AutofillOverlayListIframe extends AutofillOverlayCustomElementIframe {
  constructor() {
    super("overlay/list.html", AutofillOverlayPort.List);
  }
}

export { AutofillOverlayIconIframe, AutofillOverlayListIframe };