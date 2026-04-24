ALTER TABLE `edge_config` ADD `edge_name` text;--> statement-breakpoint
ALTER TABLE `edge_config` ADD `os` text;--> statement-breakpoint
ALTER TABLE `edge_config` ADD `os_version` text;--> statement-breakpoint
ALTER TABLE `edge_config` ADD `edge_version` text;--> statement-breakpoint
ALTER TABLE `edge_config` ADD `hardware` text;--> statement-breakpoint
ALTER TABLE `edge_config` ADD `environment` text DEFAULT 'production';--> statement-breakpoint
ALTER TABLE `edge_config` ADD `description` text;--> statement-breakpoint
ALTER TABLE `edge_config` DROP COLUMN `name`;