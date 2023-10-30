import { AccountsDeserializer } from "../../auth/services/account.service";
import { UserId } from "../../types/guid";

import { KeyDefinition } from "./key-definition";
import { StateDefinition } from "./state-definition";

const ACCOUNT_MEMORY = new StateDefinition("account", "memory");
export const ACCOUNT_ACCOUNTS = new KeyDefinition(ACCOUNT_MEMORY, "accounts", AccountsDeserializer);
export const ACCOUNT_ACTIVE_ACCOUNT_ID = new KeyDefinition(
  ACCOUNT_MEMORY,
  "activeAccountId",
  (id: UserId) => id
);
