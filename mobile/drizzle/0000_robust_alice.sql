CREATE TABLE `decks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`image` text,
	`is_free` integer DEFAULT false NOT NULL,
	`product_id` text
);
--> statement-breakpoint
CREATE TABLE `cards` (
	`id` integer PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`items` text NOT NULL,
	`fact` text,
	`deck_id` text NOT NULL,
	FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`score` integer NOT NULL,
	`drawn_cards_count` integer NOT NULL,
	`active_decks` text NOT NULL,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP)
);
