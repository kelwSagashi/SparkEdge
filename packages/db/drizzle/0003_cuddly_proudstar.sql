PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_server_types` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
INSERT INTO `__new_server_types`("id", "key", "name", "description") SELECT "id", "key", "name", "description" FROM `server_types`;--> statement-breakpoint
DROP TABLE `server_types`;--> statement-breakpoint
ALTER TABLE `__new_server_types` RENAME TO `server_types`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `server_types_key_unique` ON `server_types` (`key`);--> statement-breakpoint
ALTER TABLE `auth_type` ADD `server_type_id` text REFERENCES server_types(id);