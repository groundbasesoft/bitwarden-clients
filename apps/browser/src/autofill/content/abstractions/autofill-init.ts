import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";

import AutofillScript from "../../models/autofill-script";

type AutofillExtensionMessage = {
  command: string;
  tab?: chrome.tabs.Tab;
  sender?: string;
  fillScript?: AutofillScript;
  ciphers?: any;
  authStatus?: AuthenticationStatus;
};

type AutofillExtensionMessageHandlers = {
  [key: string]: CallableFunction;
  collectPageDetails: (message: { message: AutofillExtensionMessage }) => void;
  collectPageDetailsImmediately: (message: { message: AutofillExtensionMessage }) => void;
  fillForm: (message: { message: AutofillExtensionMessage }) => void;
  openAutofillOverlayList: (message: { message: AutofillExtensionMessage }) => void;
  removeAutofillOverlay: () => void;
};

interface AutofillInit {
  init(): void;
}

export { AutofillExtensionMessage, AutofillExtensionMessageHandlers, AutofillInit };