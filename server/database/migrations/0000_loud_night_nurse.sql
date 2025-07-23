CREATE TABLE `credentials` (
	`user_id` integer NOT NULL,
	`id` text NOT NULL,
	`public_key` text NOT NULL,
	`counter` integer NOT NULL,
	`backed_up` integer NOT NULL,
	`transports` text NOT NULL,
	PRIMARY KEY(`user_id`, `id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `credentials_id_unique` ON `credentials` (`id`);--> statement-breakpoint
CREATE TABLE `game_states` (
	`game_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	`id` integer NOT NULL,
	`state` text NOT NULL,
	`valid` integer DEFAULT true NOT NULL,
	PRIMARY KEY(`game_id`, `player_id`, `id`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_states_id_unique` ON `game_states` (`id`);--> statement-breakpoint
CREATE TABLE `games` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scoreboards` (
	`game_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	`id` integer NOT NULL,
	`score` integer NOT NULL,
	`scored_at` integer NOT NULL,
	PRIMARY KEY(`game_id`, `player_id`, `id`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scoreboards_id_unique` ON `scoreboards` (`id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`last_login_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);