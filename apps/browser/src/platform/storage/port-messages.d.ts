import {
  AbstractMemoryStorageService,
  AbstractStorageService,
} from "@bitwarden/common/platform/abstractions/storage.service";

type MemoryStoragePortMessage = {
  id?: string;
  key?: string;
  data: unknown;
  originator: "foreground" | "background";
  action?:
    | keyof Pick<AbstractMemoryStorageService, "get" | "getBypassCache" | "has" | "save" | "remove">
    | "subject_update"
    | "initialization";
};

type ChromeStoragePortMessage = {
  id?: string;
  key?: string;
  data: unknown;
  originator: "foreground" | "background";
  action?: keyof Pick<AbstractStorageService, "get" | "has">;
};
