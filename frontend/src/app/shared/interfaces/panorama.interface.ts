/* eslint-disable @typescript-eslint/naming-convention */
// frontend/src/app/shared/interfaces/panorama.interface.ts

export interface Panorama {
    apiKey: string;
    hostname: string;
    ipv4Address: string;
    ipv6Address: string;
    notes: string;
    platform: string;
    uuid: string;
    ha: boolean;
    haPeer: string | null;
    deviceType: string;
}

export interface PanoramaApiResponse {
    uuid: string;
    api_key: string;
    author: string;
    created_at: string;
    hostname: string;
    ipv4_address: string;
    ipv6_address: string;
    notes: string;
    ha: boolean;
    ha_peer: string | null;
    platform: string;
    device_type: string;
}
