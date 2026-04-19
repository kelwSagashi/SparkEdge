CREATE TABLE `edge_config` (
	`id` text PRIMARY KEY NOT NULL,
	`lat` text,
	`lng` text,
	`location_source` text DEFAULT 'manual',
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `edge_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text DEFAULT 'mqtt' NOT NULL,
	`broker_url` text,
	`username` text,
	`password` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `edge_identity` (
	`id` text PRIMARY KEY NOT NULL,
	`edge_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `edge_identity_edge_id_unique` ON `edge_identity` (`edge_id`);--> statement-breakpoint
CREATE TABLE `mqtt_commands` (
	`id` text PRIMARY KEY NOT NULL,
	`command_id` text NOT NULL,
	`type` text NOT NULL,
	`payload` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`result` text,
	`error` text,
	`created_at` text NOT NULL,
	`started_at` text,
	`finished_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mqtt_commands_command_id_unique` ON `mqtt_commands` (`command_id`);--> statement-breakpoint
CREATE TABLE `mqtt_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`topic` text NOT NULL,
	`payload` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_attempt_at` text,
	`created_at` text NOT NULL
);
