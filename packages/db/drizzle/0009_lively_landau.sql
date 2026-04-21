ALTER TABLE `edge_identity` ADD `edge_name` text;--> statement-breakpoint
ALTER TABLE `edge_identity` ADD `provisioned` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `local_fallback_storage` ADD `destination_id` text REFERENCES instance_destinations(id);