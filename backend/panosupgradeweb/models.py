# backend/panosupgradeweb/models.py

import uuid
from django.conf import settings
from django.db import models


class InventoryPlatform(models.Model):
    device_type = models.CharField(
        max_length=32,
        verbose_name="Device Type",
    )
    name = models.CharField(
        max_length=32,
        unique=True,
        verbose_name="Platform",
    )

    def __str__(self):
        return self.name


class InventoryItem(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Author",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        editable=False,
        verbose_name="Created At",
    )
    device_group = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Device Group",
    )
    ha = models.BooleanField(
        default=False,
        verbose_name="HA Enabled",
    )
    ha_peer = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="HA Peer",
    )
    hostname = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Hostname",
    )
    ipv4_address = models.GenericIPAddressField(
        protocol="IPv4",
        blank=True,
        null=True,
        verbose_name="IPv4 Address",
    )
    ipv6_address = models.GenericIPAddressField(
        protocol="IPv6",
        blank=True,
        null=True,
        verbose_name="IPv6 Address",
    )
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name="Notes",
    )
    panorama_appliance = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Panorama Appliance",
    )
    panorama_managed = models.BooleanField(
        default=False,
        null=True,
        verbose_name="Panorama Managed",
    )
    platform = models.ForeignKey(
        InventoryPlatform,
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        verbose_name="Platform",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        editable=False,
        verbose_name="Updated At",
    )
    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="UUID",
    )

    def __str__(self):
        return self.hostname


class Job(models.Model):
    task_id = models.CharField(max_length=255, unique=True, primary_key=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    job_type = models.CharField(max_length=255)
    json_data = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.task_id


class Profile(models.Model):
    active_support_check = models.BooleanField(
        default=True,
        verbose_name="Active Support Check",
    )
    arp_entry_exist_check = models.BooleanField(
        default=True,
        verbose_name="ARP Entry Exist Check",
    )
    arp_table_snapshot = models.BooleanField(
        default=True,
        verbose_name="ARP Table Snapshot",
    )
    candidate_config_check = models.BooleanField(
        default=True,
        verbose_name="Candidate Config Check",
    )
    certificates_requirements_check = models.BooleanField(
        default=True,
        verbose_name="Certificates Requirements Check",
    )
    command_timeout = models.IntegerField(
        default=60,
        verbose_name="Command Timeout",
    )
    connection_timeout = models.IntegerField(
        default=30,
        verbose_name="Connection Timeout",
    )
    content_version_check = models.BooleanField(
        default=True,
        verbose_name="Content Version Check",
    )
    content_version_snapshot = models.BooleanField(
        default=True,
        verbose_name="Content Version Snapshot",
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Description",
    )
    download_retry_interval = models.IntegerField(
        default=60,
        verbose_name="Download Retry Interval",
    )
    dynamic_updates_check = models.BooleanField(
        default=True,
        verbose_name="Dynamic Updates Check",
    )
    expired_licenses_check = models.BooleanField(
        default=True,
        verbose_name="Expired Licenses Check",
    )
    free_disk_space_check = models.BooleanField(
        default=True,
        verbose_name="Free Disk Space Check",
    )
    ha_check = models.BooleanField(
        default=True,
        verbose_name="HA Check",
    )
    install_retry_interval = models.IntegerField(
        default=60,
        verbose_name="Install Retry Interval",
    )
    ip_sec_tunnel_status_check = models.BooleanField(
        default=True,
        verbose_name="IPSec Tunnel Status Check",
    )
    ip_sec_tunnels_snapshot = models.BooleanField(
        default=True,
        verbose_name="IPSec Tunnels Snapshot",
    )
    jobs_check = models.BooleanField(
        default=True,
        verbose_name="Jobs Check",
    )
    license_snapshot = models.BooleanField(
        default=True,
        verbose_name="License Snapshot",
    )
    max_download_tries = models.IntegerField(
        default=3,
        verbose_name="Max Download Tries",
    )
    max_install_attempts = models.IntegerField(
        default=3,
        verbose_name="Max Install Attempts",
    )
    max_reboot_tries = models.IntegerField(
        default=3,
        verbose_name="Max Reboot Tries",
    )
    max_snapshot_tries = models.IntegerField(
        default=3,
        verbose_name="Max Snapshot Tries",
    )
    name = models.CharField(
        max_length=255,
        unique=True,
        verbose_name="Profile Name",
    )
    nics_snapshot = models.BooleanField(
        default=True,
        verbose_name="NICs Snapshot",
    )
    ntp_sync_check = models.BooleanField(
        default=True,
        verbose_name="NTP Sync Check",
    )
    pan_password = models.CharField(
        max_length=255,
        verbose_name="PAN Password",
    )
    pan_username = models.CharField(
        max_length=255,
        verbose_name="PAN Username",
    )
    panorama_check = models.BooleanField(
        default=True,
        verbose_name="Panorama Check",
    )
    planes_clock_sync_check = models.BooleanField(
        default=True,
        verbose_name="Planes Clock Sync Check",
    )
    readiness_checks_location = models.CharField(
        max_length=255,
        verbose_name="Readiness Checks Location",
    )
    reboot_retry_interval = models.IntegerField(
        default=60,
        verbose_name="Reboot Retry Interval",
    )
    routes_snapshot = models.BooleanField(
        default=True,
        verbose_name="Routes Snapshot",
    )
    session_exist_check = models.BooleanField(
        default=True,
        verbose_name="Session Exist Check",
    )
    session_stats_snapshot = models.BooleanField(
        default=True,
        verbose_name="Session Stats Snapshot",
    )
    snapshot_retry_interval = models.IntegerField(
        default=60,
        verbose_name="Snapshot Retry Interval",
    )
    snapshots_location = models.CharField(
        max_length=255,
        verbose_name="Snapshots Location",
    )
    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name="UUID",
    )
