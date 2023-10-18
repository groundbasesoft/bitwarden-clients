import { AbstractStorageService } from "@bitwarden/common/platform/abstractions/storage.service";

type ChromeStoragePortMessage = {
  id?: string;
  key?: string;
  data: string;
  originator: "foreground" | "background";
  action?: keyof Pick<AbstractStorageService, "get" | "has">;
};
