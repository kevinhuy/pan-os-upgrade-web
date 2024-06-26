import { CommonModule } from "@angular/common";
import { DocViewer } from "./doc-viewer";
import { HeaderLink } from "./header-link";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NgModule } from "@angular/core";
import { PortalModule } from "@angular/cdk/portal";

// ExampleViewer is included in the DocViewerModule because they have a circular dependency.
@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatTabsModule,
        PortalModule,
        DocViewer,
        HeaderLink,
    ],
    exports: [DocViewer, HeaderLink],
})
export class DocViewerModule {}
