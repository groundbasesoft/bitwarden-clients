import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { SidebarService } from "@bitwarden/components";

import { SecretsManagerLogo } from "./secrets-manager-logo";

@Component({
  selector: "sm-navigation",
  templateUrl: "./navigation.component.html",
})
export class NavigationComponent {
  protected readonly logo = SecretsManagerLogo;
  protected orgFilter = (org: Organization) => org.canAccessSecretsManager;
  protected isAdmin$ = this.route.params.pipe(
    map((params) => this.organizationService.get(params.organizationId)?.isAdmin)
  );

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    protected sidebarService: SidebarService
  ) {}
}
