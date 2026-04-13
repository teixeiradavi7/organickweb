CREATE TABLE `onboarding_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`responses` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `onboarding_responses_id` PRIMARY KEY(`id`),
	CONSTRAINT `onboarding_responses_userId_unique` UNIQUE(`userId`)
);
