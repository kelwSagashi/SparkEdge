ALTER TABLE `devices` ADD `resource_operation_id` text REFERENCES resource_operations(id);--> statement-breakpoint
ALTER TABLE `resource_operations` ADD `input_schema` text;--> statement-breakpoint
ALTER TABLE `resource_operations` ADD `output_schema` text;