/* eslint-disable max-len */
// src/app/shared/services/upgrade.service.ts

import {
    ForbiddenError,
    NotFoundError,
    ServerError,
    UnauthorizedError,
    UpgradeError,
} from "../errors/upgrade.error";
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
} from "@angular/common/http";
import { Observable, throwError, timer } from "rxjs";
import { catchError, mergeMap, retryWhen } from "rxjs/operators";

import { CancelUpgradeResponse } from "../interfaces/cancel-upgrade-response.interface";
import { CookieService } from "ngx-cookie-service";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UpgradeForm } from "../interfaces/upgrade-form.interface";
import { UpgradeHistory } from "../interfaces/upgrade-history.interface";
import { UpgradeResponse } from "../interfaces/upgrade-response.interface";
import { UpgradeStatus } from "../interfaces/upgrade-status.interface";
import { environment } from "../../../environments/environment.prod";

@Injectable({
    providedIn: "root",
})
export class UpgradeService {
    private apiUrl = environment.apiUrl;
    private apiEndpointUpgrade = `${this.apiUrl}/api/v1/inventory/upgrade/`;
    private apiEndpointUpgradeCancel = `${this.apiEndpointUpgrade}/cancel/`;
    private apiEndpointUpgradeStatus = `${this.apiEndpointUpgrade}/status/`;
    private apiEndpointUpgradeHistory = `${this.apiUrl}/api/v1/upgrade/history/`;

    constructor(
        private cookieService: CookieService,
        private http: HttpClient,
        private snackBar: MatSnackBar,
    ) {}

    /**
     * Constructs an HttpHeaders object with the Authorization header set to the authentication token.
     *
     * @returns The HttpHeaders object.
     */
    private getAuthHeaders(): HttpHeaders {
        const authToken = this.cookieService.get("auth_token");
        return new HttpHeaders().set("Authorization", `Token ${authToken}`);
    }

    /**
     * Handles the error response from an HTTP request and returns an Observable that emits the error.
     *
     * @param error - The HttpErrorResponse object representing the error response.
     * @returns An Observable that emits the error.
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let profileError: UpgradeError;

        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred.
            profileError = new UpgradeError(
                error.error,
                `An error occurred: ${error.error.message}`,
            );
        } else {
            // The backend returned an unsuccessful response code.
            switch (error.status) {
                case 401:
                    profileError = new UnauthorizedError(error);
                    break;
                case 403:
                    profileError = new ForbiddenError(error);
                    break;
                case 404:
                    profileError = new NotFoundError(error);
                    break;
                case 500: // Handle a specific 500 error if needed
                    profileError = new ServerError(error);
                    break;
                default:
                    profileError = new UpgradeError(
                        error,
                        `Backend returned code ${error.status}, body was: ${error.error}`,
                    );
            }
        }

        this.snackBar.open(profileError.message, "Close", {
            duration: 5000,
            verticalPosition: "bottom",
        });

        return throwError(() => profileError);
    }

    /**
     * Determines whether the HTTP request should be retried based on the error response.
     * Retry is only performed for 5xx errors (server errors) and network errors.
     *
     * @param error - The HTTP error response.
     * @returns A boolean value indicating whether the request should be retried.
     */
    private shouldRetry(error: HttpErrorResponse): boolean {
        // Retry only for 5xx errors (server errors) and network errors
        return error.status >= 500 || error.error instanceof ErrorEvent;
    }

    /**
     * Upgrades a device using the provided upgrade form.
     *
     * @param upgradeForm - The upgrade form containing the necessary data for the upgrade.
     * @returns An Observable that emits the upgrade response or null if the request fails.
     */
    upgradeDevice(
        upgradeForm: UpgradeForm,
    ): Observable<UpgradeResponse | null> {
        return this.http
            .post<UpgradeResponse>(this.apiEndpointUpgrade, upgradeForm, {
                headers: this.getAuthHeaders(),
            })
            .pipe(
                // Retry the request for server errors up to 3 times with an exponential backoff strategy
                retryWhen((errors) =>
                    errors.pipe(
                        mergeMap((error: HttpErrorResponse, i) => {
                            const retryAttempt = i + 1;
                            if (retryAttempt <= 3 && this.shouldRetry(error)) {
                                // Apply an exponential backoff strategy
                                const delayTime =
                                    Math.pow(2, retryAttempt) * 1000;
                                return timer(delayTime);
                            } else {
                                // After 3 retries, throw error
                                return throwError(() => error);
                            }
                        }),
                    ),
                ),
                // Log an error message and return an empty array if the request fails
                catchError(this.handleError.bind(this)),
            );
    }

    /**
     * Retrieves the upgrade history for a given UUID.
     *
     * @param uuid - The UUID of the upgrade history to retrieve.
     * @returns An Observable that emits an array of UpgradeHistory objects.
     */
    getUpgradeHistory(uuid: string): Observable<UpgradeHistory[]> {
        const url = `${this.apiEndpointUpgradeHistory}${uuid}`;

        return this.http
            .get<UpgradeHistory[]>(url, {
                headers: this.getAuthHeaders(),
            })
            .pipe(
                // Retry the request for server errors up to 3 times with an exponential backoff strategy
                retryWhen((errors) =>
                    errors.pipe(
                        mergeMap((error: HttpErrorResponse, i) => {
                            const retryAttempt = i + 1;
                            if (retryAttempt <= 3 && this.shouldRetry(error)) {
                                // Apply an exponential backoff strategy
                                const delayTime =
                                    Math.pow(2, retryAttempt) * 1000;
                                return timer(delayTime);
                            } else {
                                // After 3 retries, throw error
                                return throwError(() => error);
                            }
                        }),
                    ),
                ),
                // Log an error message and return an empty array if the request fails
                catchError(this.handleError.bind(this)),
            );
    }

    /**
     * Retrieves the upgrade status for a given UUID.
     *
     * @param uuid - The UUID of the upgrade status to retrieve.
     * @returns An Observable that emits the UpgradeStatus object.
     */
    getUpgradeStatus(uuid: string): Observable<UpgradeStatus> {
        return this.http
            .get<UpgradeStatus>(`${this.apiEndpointUpgradeStatus}${uuid}`, {
                headers: this.getAuthHeaders(),
            })
            .pipe(
                // Retry the request for server errors up to 3 times with an exponential backoff strategy
                retryWhen((errors) =>
                    errors.pipe(
                        mergeMap((error: HttpErrorResponse, i) => {
                            const retryAttempt = i + 1;
                            if (retryAttempt <= 3 && this.shouldRetry(error)) {
                                // Apply an exponential backoff strategy
                                const delayTime =
                                    Math.pow(2, retryAttempt) * 1000;
                                return timer(delayTime);
                            } else {
                                // After 3 retries, throw error
                                return throwError(() => error);
                            }
                        }),
                    ),
                ),
                // Log an error message and return an empty array if the request fails
                catchError(this.handleError.bind(this)),
            );
    }

    /**
     * TODO: This endpoint does not currently exist
     * Cancels an upgrade operation.
     *
     * @param uuid - The UUID of the upgrade operation to cancel.
     * @returns An Observable that emits a CancelUpgradeResponse object.
     */
    cancelUpgrade(uuid: string): Observable<CancelUpgradeResponse> {
        // Construct URL with placeholder
        const url = `${this.apiEndpointUpgradeCancel}${uuid}/`;

        return this.http
            .post<CancelUpgradeResponse>(
                url,
                {},
                { headers: this.getAuthHeaders() },
            )
            .pipe(
                // Retry the request for server errors up to 3 times with an exponential backoff strategy
                retryWhen((errors) =>
                    errors.pipe(
                        mergeMap((error: HttpErrorResponse, i) => {
                            const retryAttempt = i + 1;
                            if (retryAttempt <= 3 && this.shouldRetry(error)) {
                                // Apply an exponential backoff strategy
                                const delayTime =
                                    Math.pow(2, retryAttempt) * 1000;
                                return timer(delayTime);
                            } else {
                                // After 3 retries, throw error
                                return throwError(() => error);
                            }
                        }),
                    ),
                ),
                // Log an error message and return an empty array if the request fails
                catchError(this.handleError.bind(this)),
            );
    }
}
