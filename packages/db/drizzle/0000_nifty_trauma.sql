CREATE TABLE `auth_type` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`strategy` text NOT NULL,
	`fields` text
);
--> statement-breakpoint
CREATE TABLE `credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`auth_type_id` text NOT NULL,
	`data` text NOT NULL,
	`owner_id` text,
	`project_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`auth_type_id`) REFERENCES `auth_type`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `data_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`instance_destination_id` text NOT NULL,
	`mapping` text NOT NULL,
	`transform_script` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`instance_destination_id`) REFERENCES `instance_destinations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` text PRIMARY KEY NOT NULL,
	`device_id` text,
	`name` text NOT NULL,
	`brand` text NOT NULL,
	`serial_number` text,
	`connection_method` text DEFAULT 'none' NOT NULL,
	`ip_address` text,
	`location` text,
	`description` text,
	`others` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `devices_device_id_unique` ON `devices` (`device_id`);--> statement-breakpoint
CREATE TABLE `downloaded_scripts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`author` text NOT NULL,
	`version` text DEFAULT '1.0.0' NOT NULL,
	`source` text DEFAULT 'local' NOT NULL,
	`github_repo` text,
	`github_ref` text,
	`local_path` text NOT NULL,
	`main_file` text NOT NULL,
	`venv_path` text,
	`requirements_file` text,
	`venv_ready` integer,
	`language` text DEFAULT 'python' NOT NULL,
	`tags` text,
	`schema_config` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `instance_destinations` (
	`id` text PRIMARY KEY NOT NULL,
	`instance_id` text NOT NULL,
	`resource_operation_id` text NOT NULL,
	`enabled` integer,
	`priority` integer DEFAULT 0,
	`retry_policy` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`instance_id`) REFERENCES `instances`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`resource_operation_id`) REFERENCES `resource_operations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `instance_executions` (
	`id` text PRIMARY KEY NOT NULL,
	`instance_id` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`trigger_type` text DEFAULT 'interval' NOT NULL,
	`started_at` text,
	`finished_at` text,
	`duration_ms` integer,
	`logs` text,
	`output` text,
	`error_message` text,
	`destination_sent` integer,
	`fallback_used` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`instance_id`) REFERENCES `instances`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `instance_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`instance_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`instance_id`) REFERENCES `instances`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `instances` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tags` text,
	`status` text DEFAULT 'idle' NOT NULL,
	`active` integer,
	`project_id` text NOT NULL,
	`device_id` text,
	`script_id` text,
	`trigger_type` text DEFAULT 'interval' NOT NULL,
	`trigger_config` text NOT NULL,
	`fallback_enabled` integer,
	`fallback_strategy` text DEFAULT 'background_job',
	`fallback_retry_interval_seconds` integer DEFAULT 300,
	`on_error_action` text DEFAULT 'log_only' NOT NULL,
	`on_error_config` text,
	`created_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`device_id`) REFERENCES `devices`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`script_id`) REFERENCES `downloaded_scripts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `local_fallback_storage` (
	`id` text PRIMARY KEY NOT NULL,
	`instance_id` text NOT NULL,
	`execution_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`payload` text NOT NULL,
	`filepath` text,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`last_retry_at` text,
	`next_retry_at` text,
	`last_error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`instance_id`) REFERENCES `instances`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`execution_id`) REFERENCES `instance_executions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `project_members` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`key` text NOT NULL,
	`description` text,
	`visibility` text DEFAULT 'private' NOT NULL,
	`owner_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_key_unique` ON `projects` (`key`);--> statement-breakpoint
CREATE TABLE `resource_operations` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`config` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`resource_id`) REFERENCES `server_resources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `server_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`server_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`config` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `server_types` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `server_types_key_unique` ON `server_types` (`key`);--> statement-breakpoint
CREATE TABLE `servers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`server_type_id` text,
	`driver_key` text NOT NULL,
	`credential_id` text,
	`headers` text,
	`project_id` text NOT NULL,
	`created_by` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`server_type_id`) REFERENCES `server_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`credential_id`) REFERENCES `credentials`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#6b7280',
	`project_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_project_id_name_unique` ON `tags` (`project_id`,`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`password_hash` text,
	`role` text DEFAULT 'viewer' NOT NULL,
	`is_active` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`api_key` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);