import { NgModule } from "@angular/core";

import { CollectionBadgeModule } from "../../admin-console/organizations/collections/collection-badge/collection-badge.module";
import { GroupBadgeModule } from "../../admin-console/organizations/collections/group-badge/group-badge.module";
import { CollectionDialogComponent } from "../../admin-console/organizations/shared/components/collection-dialog";
import { LooseComponentsModule, SharedModule } from "../../shared";

import { BulkDialogsModule } from "./bulk-action-dialogs/bulk-dialogs.module";
import { OrganizationBadgeModule } from "./organization-badge/organization-badge.module";
import { PipesModule } from "./pipes/pipes.module";
import { VaultRoutingModule } from "./vault-routing.module";
import { VaultComponent } from "./vault.component";
import { ViewComponent } from "./view.component";

@NgModule({
  imports: [
    VaultRoutingModule,
    OrganizationBadgeModule,
    GroupBadgeModule,
    CollectionBadgeModule,
    PipesModule,
    SharedModule,
    LooseComponentsModule,
    BulkDialogsModule,
    CollectionDialogComponent,
    VaultComponent,
    ViewComponent,
  ],
})
export class VaultModule {}
