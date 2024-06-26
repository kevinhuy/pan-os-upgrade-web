/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
// src/app/pages/inventory-create/inventory-create.ts

import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from "@angular/forms";
import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";

import { CommonModule } from "@angular/common";
import { ComponentPageTitle } from "../page-title/page-title";
import { CookieService } from "ngx-cookie-service";
import { Device } from "../../shared/interfaces/device.interface";
import { DeviceType } from "../../shared/interfaces/device-type.interface";
import { Footer } from "src/app/shared/footer/footer";
import { InventoryService } from "../../shared/services/inventory.service";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "app-inventory-create",
    templateUrl: "./inventory-create.html",
    styleUrls: ["./inventory-create.scss"],
    standalone: true,
    imports: [
        CommonModule,
        Footer,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
    ],
})
export class InventoryCreateComponent implements OnDestroy, OnInit {
    @HostBinding("class.main-content") readonly mainContentClass = true;
    createInventoryForm: FormGroup;
    devices: Device[] = [];
    firewallPlatforms: DeviceType[] = [];
    panoramaPlatforms: DeviceType[] = [];
    private destroy$ = new Subject<void>();

    constructor(
        private cookieService: CookieService,
        private formBuilder: FormBuilder,
        private inventoryService: InventoryService,
        private router: Router,
        private snackBar: MatSnackBar,
        public _componentPageTitle: ComponentPageTitle,
    ) {
        this.createInventoryForm = this.formBuilder.group({
            app_version: [""],
            device_group: [""],
            device_type: ["Firewall", Validators.required],
            ha_enabled: [false],
            hostname: ["", Validators.required],
            ipv4_address: [
                "",
                [
                    Validators.pattern(
                        // eslint-disable-next-line max-len
                        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                    ),
                ],
            ],
            ipv6_address: [
                "",
                [
                    Validators.pattern(
                        // eslint-disable-next-line max-len
                        /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
                    ),
                ],
            ],
            local_state: [""],
            notes: [""],
            panorama_appliance_id: [""],
            panorama_ipv4_address: [
                "",
                [
                    Validators.pattern(
                        // eslint-disable-next-line max-len
                        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                    ),
                ],
            ],
            panorama_ipv6_address: [
                "",
                [
                    Validators.pattern(
                        // eslint-disable-next-line max-len
                        /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
                    ),
                ],
            ],
            panorama_managed: [false],
            peer_device: [""],
            peer_ip: [""],
            peer_state: [""],
            platform_name: ["", Validators.required],
            serial: [""],
            sw_version: [""],
        });
    }

    /**
     * Creates a device in the inventory.
     *
     * @returns
     */
    createDevice(): void {
        if (this.createInventoryForm && this.createInventoryForm.valid) {
            const author = this.cookieService.get("author");
            const formValue = this.createInventoryForm.value;
            formValue.author = author;

            if (formValue.device_type === "Panorama") {
                delete formValue.device_group;
                delete formValue.panorama_appliance_id;
                delete formValue.panorama_managed;
            }

            this.inventoryService
                .createDevice(formValue)
                .pipe(takeUntil(this.destroy$))
                .subscribe(
                    () => {
                        this.router.navigate(["/inventory"]);
                    },
                    (error) => {
                        console.error("Error creating inventory item:", error);
                        this.snackBar.open(
                            "Failed to create inventory item. Please try again.",
                            "Close",
                            {
                                duration: 3000,
                            },
                        );
                    },
                );
        }
    }

    /**
     * Fetches devices from the inventory service and assigns them to the "devices" property.
     *
     * @returns
     */
    getDevices(): void {
        this.inventoryService
            .getDevices()
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (devices) => {
                    this.devices = devices;
                },
                (error) => {
                    console.error("Error fetching devices:", error);
                },
            );
    }

    /**
     * Fetches the firewall platforms from the inventory service.
     *
     * @returns
     */
    getFirewallPlatforms(): void {
        this.inventoryService
            .getFirewallPlatforms()
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (platforms: DeviceType[]) => {
                    this.firewallPlatforms = platforms;
                },
                (error: any) => {
                    console.error("Error fetching firewall platforms:", error);
                    this.snackBar.open(
                        "Failed to fetch firewall platforms. Please try again.",
                        "Close",
                        {
                            duration: 3000,
                        },
                    );
                },
            );
    }

    /**
     * Retrieves the panorama platforms from the inventory service and stores them in the "panoramaPlatforms" property.
     *
     * @returns
     */
    getPanoramaPlatforms(): void {
        this.inventoryService
            .getPanoramaPlatforms()
            .pipe(takeUntil(this.destroy$))
            .subscribe(
                (platforms: DeviceType[]) => {
                    this.panoramaPlatforms = platforms;
                },
                (error: any) => {
                    console.error("Error fetching panorama platforms:", error);
                    this.snackBar.open(
                        "Failed to fetch panorama platforms. Please try again.",
                        "Close",
                        {
                            duration: 3000,
                        },
                    );
                },
            );
    }

    /**
     * Executes the ngOnDestroy method to clean up resources.
     *
     * @return
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Initializes the component and performs necessary initialization tasks.
     * Sets the page title to "Inventory Create".
     * Retrieves devices and firewall platforms.
     * Sets validators for the createInventoryForm.
     * Subscribes to changes in the "device_type" form control and updates the form validation accordingly.
     *
     * @return
     */
    ngOnInit(): void {
        this._componentPageTitle.title = "Inventory Create";
        this.getDevices();
        this.getFirewallPlatforms();
        this.createInventoryForm.setValidators(this.requireIpAddress());
        this.createInventoryForm
            .get("device_type")
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((device_type) => {
                if (device_type === "Firewall") {
                    this.getFirewallPlatforms();
                } else if (device_type === "Panorama") {
                    this.getPanoramaPlatforms();
                }
                this.updateFormValidation(device_type);
            });
    }

    /**
     * Resets the inventory form and navigates to the inventory page.
     *
     * @returns
     */
    onCancel(): void {
        this.createInventoryForm.reset();
        this.router.navigate(["/inventory"]);
    }

    /**
     * Validates the IP addresses in a form control.
     *
     * @param control - The form control to validate.
     * @returns An object containing validation errors, or null if the IP addresses are valid.
     */
    requireIpAddress(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const ipv4Control = control.get("ipv4_address");
            const ipv6Control = control.get("ipv6_address");
            const panoramaManagedControl = control.get("panorama_managed");
            const panoramaIpv4Control = control.get("panorama_ipv4_address");
            const panoramaIpv6Control = control.get("panorama_ipv6_address");

            if (
                (ipv4Control && ipv4Control.value && ipv4Control.invalid) ||
                (ipv6Control && ipv6Control.value && ipv6Control.invalid)
            ) {
                return { invalidIpAddress: true };
            }

            if (!ipv4Control?.value && !ipv6Control?.value) {
                return { requireIpAddress: true };
            }

            if (panoramaManagedControl?.value) {
                if (
                    (panoramaIpv4Control &&
                        panoramaIpv4Control.value &&
                        panoramaIpv4Control.invalid) ||
                    (panoramaIpv6Control &&
                        panoramaIpv6Control.value &&
                        panoramaIpv6Control.invalid)
                ) {
                    return { invalidPanoramaIpAddress: true };
                }

                if (
                    !panoramaIpv4Control?.value &&
                    !panoramaIpv6Control?.value
                ) {
                    return { requirePanoramaIpAddress: true };
                }
            }

            return null;
        };
    }

    /**
     * Update form validation based on the given device type.
     * Clears or sets validators for specific form controls
     *
     * @param device_type - The type of the device (e.g., "Firewall", "Panorama")
     *
     * @return
     */
    updateFormValidation(device_type: string): void {
        const device_groupControl =
            this.createInventoryForm.get("device_group");
        const panorama_applianceControl = this.createInventoryForm.get(
            "panorama_appliance_id",
        );
        const panorama_managedControl =
            this.createInventoryForm.get("panorama_managed");

        if (device_type === "Firewall") {
            device_groupControl?.setValidators([]);
            panorama_applianceControl?.setValidators([]);
            panorama_managedControl?.setValidators([]);
        } else if (device_type === "Panorama") {
            device_groupControl?.clearValidators();
            panorama_applianceControl?.clearValidators();
            panorama_managedControl?.clearValidators();
        }

        device_groupControl?.updateValueAndValidity();
        panorama_applianceControl?.updateValueAndValidity();
        panorama_managedControl?.updateValueAndValidity();
    }
}
