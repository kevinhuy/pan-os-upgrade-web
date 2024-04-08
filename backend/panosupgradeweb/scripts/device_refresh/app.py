# backend/panosupgradeweb/scripts/device_refresh/app.py

import json
import logging
import sys
import xml.etree.ElementTree as ET

from panos.firewall import Firewall
from panos.panorama import Panorama

# trunk-ignore(pyright/reportMissingImports)
from panosupgradeweb.models import Device, DeviceType, Profile


def find_devicegroup_by_serial(data, serial):
    for entry in data:
        if "devices" in entry:
            for device in entry["devices"]:
                if device["serial"] == serial:
                    return entry["@name"]
    return None


def flatten_xml_to_dict(element: ET.Element) -> dict:
    result = {}
    for child_element in element:
        child_tag = child_element.tag
        if child_element.text and len(child_element) == 0:
            result[child_tag] = child_element.text
        else:
            if child_tag in result:
                if not isinstance(result.get(child_tag), list):
                    result[child_tag] = [
                        result.get(child_tag),
                        flatten_xml_to_dict(element=child_element),
                    ]
                else:
                    result[child_tag].append(flatten_xml_to_dict(element=child_element))
            else:
                if child_tag == "entry":
                    result[child_tag] = [flatten_xml_to_dict(element=child_element)]
                else:
                    result[child_tag] = flatten_xml_to_dict(element=child_element)

    return result


def get_device_group_mapping(panorama: Panorama):
    device_group_mappings = []
    device_groups = panorama.op("show devicegroups")

    # Iterate over each 'entry' element under 'devicegroups'
    for entry in device_groups.findall(".//devicegroups/entry"):
        entry_dict = {"@name": entry.get("name")}

        # Check if the 'entry' has 'devices' element
        devices_elem = entry.find("devices")
        if devices_elem is not None:
            devices = []

            # Iterate over each 'entry' element under 'devices'
            for device in devices_elem.findall("entry"):
                device_dict = {
                    "@name": device.get("name"),
                    "serial": device.find("serial").text,
                    "connected": device.find("connected").text,
                }
                devices.append(device_dict)

            entry_dict["devices"] = devices

        device_group_mappings.append(entry_dict)

    return device_group_mappings


def run_device_refresh(
    device_uuid,
    profile_uuid,
    author_id,
):
    logging.debug(f"Running inventory sync for Panorama device: {device_uuid}")
    logging.debug(f"Using profile: {profile_uuid}")
    logging.debug(f"Author ID: {author_id}")

    # Initialize an empty dictionary to store the device data
    device_data = {}

    # Retrieve the PAN device, device type, and profile objects from the database
    device = Device.objects.get(uuid=device_uuid)
    profile = Profile.objects.get(uuid=profile_uuid)
    platform = DeviceType.objects.get(name=device.platform)

    # Build the PAN device object
    try:
        # if the device is not managed by Panorama, then we will connect to it directly
        if platform.device_type == "Firewall" and not device.panorama_managed:
            # Connect to the firewall device using the retrieved credentials
            pan_device = Firewall(
                device.ipv4_address,
                profile.pan_username,
                profile.pan_password,
            )

        elif platform.device_type == "Firewall" and device.panorama_managed:
            pan_device = Firewall(
                serial=device.serial,
            )
            panorama = Panorama(
                device.panorama_ipv4_address,
                profile.pan_username,
                profile.pan_password,
            )
            panorama.add(pan_device)

            # Retrieve device group
            device_group_mappings = get_device_group_mapping(panorama)
            device_data["device_group"] = find_devicegroup_by_serial(
                device_group_mappings,
                device.serial,
            )

        else:
            # Connect to the Panorama device using the retrieved credentials
            pan_device = Panorama(
                device.ipv4_address,
                profile.pan_username,
                profile.pan_password,
            )

    except Exception as e:
        logging.error(f"Error while building the PAN object: {str(e)}")
        raise e

    # Connect to the PAN device and retrieve the system information
    try:
        # Retrieve the system information from the firewall device
        system_info = pan_device.show_system_info()

        # Store the relevant system information in the device_data dictionary
        device_data["hostname"] = system_info["system"]["hostname"]
        device_data["ipv4_address"] = system_info["system"]["ip-address"]
        device_data["ipv6_address"] = (
            system_info["system"]["ipv6-address"]
            if system_info["system"]["ipv6-address"] != "unknown"
            else None
        )
        device_data["serial"] = system_info["system"]["serial"]
        device_data["sw_version"] = system_info["system"]["sw-version"]
        device_data["app_version"] = (
            system_info["system"]["app-version"]
            if platform.device_type == "Firewall"
            else None
        )
        device_data["threat_version"] = (
            system_info["system"]["threat-version"]
            if platform.device_type == "Firewall"
            else None
        )
        device_data["uptime"] = system_info["system"]["uptime"]
        device_data["platform"] = platform.name

        # Retrieve the HA state information from the firewall device
        ha_info = pan_device.show_highavailability_state()

        # Parse the HA state information and store it in the device_data dictionary
        if platform.device_type == "Firewall" and ha_info[0] != "disabled":
            device_data["ha"] = True

            if isinstance(ha_info[1], ET.Element):
                ha_details = flatten_xml_to_dict(element=ha_info[1])
            else:
                logging.debug("ha_info[1] is not an ET.Element")
                sys.exit(1)

            # Handle the error case here
            device_data["ha_mode"] = (
                ha_details.get("result", {})
                .get("group", {})
                .get("local-info", {})
                .get("mode")
            )
            device_data["ha_status"] = (
                ha_details.get("result", {})
                .get("group", {})
                .get("local-info", {})
                .get("state")
            )
            device_data["ha_peer"] = (
                ha_details.get("result", {})
                .get("group", {})
                .get("peer-info", {})
                .get("mgmt-ip", "")
                .split("/")[0]
            )
        elif platform.device_type == "Panorama" and ha_info[0] != "disabled":
            device_data["ha"] = True

            if isinstance(ha_info[1], ET.Element):
                ha_details = flatten_xml_to_dict(element=ha_info[1])
            else:
                logging.debug("ha_info[1] is not an ET.Element")
                sys.exit(1)

            device_data["ha_mode"] = (
                ha_details.get("result", {}).get("local-info", {}).get("mode")
            )
            device_data["ha_status"] = (
                ha_details.get("result", {}).get("local-info", {}).get("state")
            )
            device_data["ha_peer"] = (
                ha_details.get("result", {})
                .get("peer-info", {})
                .get("mgmt-ip", "")
                .split("/")[0]
            )
        else:
            device_data["ha"] = False
            device_data["ha_mode"] = None
            device_data["ha_status"] = None
            device_data["ha_peer"] = None

        # Store additional device information in the device_data dictionary
        device_data["panorama_managed"] = device.panorama_managed
        device_data["panorama_appliance"] = (
            device.panorama_appliance if device.panorama_managed else None
        )

        # Create or update the Device object using the device_data dictionary
        inventory_item, created = Device.objects.update_or_create(
            hostname=device_data["hostname"],
            defaults={
                "app_version": device_data["app_version"],
                "author_id": author_id,
                "device_group": device_data.get("device_group"),
                "ha": device_data["ha"],
                "ha_mode": device_data["ha_mode"],
                "ha_peer": device_data["ha_peer"],
                "ha_status": device_data["ha_status"],
                "ipv4_address": device_data["ipv4_address"],
                "ipv6_address": device_data["ipv6_address"],
                "panorama_managed": device_data["panorama_managed"],
                "panorama_appliance": device_data["panorama_appliance"],
                "serial": device_data["serial"],
                "sw_version": device_data["sw_version"],
                "threat_version": device_data["threat_version"],
                "uptime": device_data["uptime"],
            },
        )

        # Add the created flag to the device_data dictionary
        device_data["created"] = created

        # Serialize the device_data dictionary to JSON
        return json.dumps(device_data, indent=2)

    except Exception as e:
        logging.error(f"Error during inventory sync: {str(e)}")
        raise e
