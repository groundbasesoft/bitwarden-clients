import { StateDefinition } from "./state-definition";

export const ACCOUNT_MEMORY = new StateDefinition("account", "memory");

/**
 * @deprecated This is a temporary state definition, we'd like to remove state service entirely
 */
export const STATE_MEMORY = new StateDefinition("state", "memory");
