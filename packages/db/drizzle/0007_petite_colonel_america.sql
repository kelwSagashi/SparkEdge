ALTER TABLE `data_mappings` ADD `payload_template` text;--> statement-breakpoint
ALTER TABLE `data_mappings` ADD `custom_fields` text;--> statement-breakpoint
ALTER TABLE `instances` ADD `include_device_data` integer;--> statement-breakpoint
ALTER TABLE `instances` ADD `script_parameters` text NOT NULL;