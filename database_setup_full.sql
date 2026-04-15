-- ============================================================
-- Full database setup / sync script (idempotent, MySQL 8+)
-- Creates missing tables and columns used by the system
-- No drops; safe to run multiple times
-- ============================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- Helper: create database if needed (edit name as appropriate)
-- CREATE DATABASE IF NOT EXISTS `dawamdb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `dawamdb`;

-- ============================================================
-- Users
-- PK is user_id (per backend code)
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(8) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Vacation types
-- ============================================================
CREATE TABLE IF NOT EXISTS `vacationstypes` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `is_yearly` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Vacations (requests) - minimal fields to satisfy usage
-- ============================================================
CREATE TABLE IF NOT EXISTS `vacations` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `vacationstype_id` bigint(20) UNSIGNED NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(32) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vacations_user_id_index` (`user_id`),
  KEY `vacations_vacationstype_id_index` (`vacationstype_id`),
  CONSTRAINT `vacations_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  CONSTRAINT `vacations_type_fk` FOREIGN KEY (`vacationstype_id`) REFERENCES `vacationstypes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Vacations balances per user
-- ============================================================
CREATE TABLE IF NOT EXISTS `vacations_users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `vacationstype_id` bigint(20) UNSIGNED NOT NULL,
  `amount` int(11) NOT NULL DEFAULT 0 COMMENT 'balance in minutes',
  `period_type` ENUM('monthly','yearly') DEFAULT 'monthly' COMMENT 'نوع الفترة',
  `transfer_from_year` YEAR NULL COMMENT 'السنة المصدر في حالة الترحيل',
  `type` INT UNSIGNED NULL COMMENT '34=مرحل, 35=حالي, 36=محول',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vacations_users_user_idx` (`user_id`,`vacationstype_id`),
  KEY `vacations_users_period_type_index` (`period_type`),
  KEY `vacations_users_transfer_from_year_index` (`transfer_from_year`),
  CONSTRAINT `vacations_users_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  CONSTRAINT `vacations_users_type_fk` FOREIGN KEY (`vacationstype_id`) REFERENCES `vacationstypes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure new columns exist (idempotent ALTER)
ALTER TABLE `vacations_users`
  ADD COLUMN IF NOT EXISTS `period_type` ENUM('monthly','yearly') DEFAULT 'monthly' COMMENT 'نوع الفترة: شهرية أو سنوية' AFTER `amount`,
  ADD COLUMN IF NOT EXISTS `transfer_from_year` YEAR NULL COMMENT 'السنة المصدر في حالة الترحيل' AFTER `period_type`,
  ADD COLUMN IF NOT EXISTS `type` INT UNSIGNED NULL COMMENT '34=مرحل من العام الماضي, 35=رصيد العام الحالي, 36=رصيد محول' AFTER `vacationstype_id`;

UPDATE `vacations_users` SET `period_type` = 'monthly' WHERE `period_type` IS NULL;

CREATE INDEX IF NOT EXISTS `vacations_users_period_type_index` ON `vacations_users` (`period_type`);
CREATE INDEX IF NOT EXISTS `vacations_users_transfer_from_year_index` ON `vacations_users` (`transfer_from_year`);

-- ============================================================
-- Leave transfers log
-- ============================================================
CREATE TABLE IF NOT EXISTS `leave_transfers` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `vacationstype_id` bigint(20) UNSIGNED NOT NULL,
  `amount` int(11) NOT NULL COMMENT 'minutes',
  `from_year` year(4) NOT NULL,
  `to_year` year(4) NOT NULL,
  `transfer_date` datetime NOT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `leave_transfers_user_id_index` (`user_id`),
  KEY `leave_transfers_vacationstype_id_index` (`vacationstype_id`),
  KEY `leave_transfers_transfer_date_index` (`transfer_date`),
  KEY `leave_transfers_user_id_from_year_to_year_index` (`user_id`,`from_year`,`to_year`),
  CONSTRAINT `leave_transfers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  CONSTRAINT `leave_transfers_vacationstype_id_foreign` FOREIGN KEY (`vacationstype_id`) REFERENCES `vacationstypes`(`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_transfers_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ترحيلات الإجازات';

-- ============================================================
-- Attendance logs
-- ============================================================
CREATE TABLE IF NOT EXISTS `attendancelogs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `attendance_time` time DEFAULT NULL,
  `leave_time` time DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `canceled` int(11) DEFAULT 0,
  `netPeriod` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attendancelogs_user_date_idx` (`user_id`,`date`),
  CONSTRAINT `attendancelogs_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Events (device punches)
-- ============================================================
CREATE TABLE IF NOT EXISTS `events` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `events_datetime` datetime NOT NULL,
  `device_id` int(11) NULL DEFAULT NULL,
  `device_ip` varchar(45) NULL DEFAULT NULL,
  `device_name` varchar(255) NULL DEFAULT NULL,
  `event_type` int(11) NULL DEFAULT NULL COMMENT '0=In,1=Out',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `events_user_datetime_idx` (`user_id`,`events_datetime`),
  KEY `idx_device_id` (`device_id`),
  KEY `idx_device_ip` (`device_ip`),
  CONSTRAINT `events_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add missing device columns if table existed without them
ALTER TABLE `events`
  ADD COLUMN IF NOT EXISTS `device_id` INT(11) NULL DEFAULT NULL AFTER `events_datetime`,
  ADD COLUMN IF NOT EXISTS `device_ip` VARCHAR(45) NULL DEFAULT NULL AFTER `device_id`,
  ADD COLUMN IF NOT EXISTS `device_name` VARCHAR(255) NULL DEFAULT NULL AFTER `device_ip`,
  ADD COLUMN IF NOT EXISTS `event_type` INT(11) NULL DEFAULT NULL COMMENT 'نوع الحدث: 0=دخول, 1=خروج' AFTER `device_name`,
  ADD INDEX IF NOT EXISTS `idx_device_id` (`device_id`),
  ADD INDEX IF NOT EXISTS `idx_device_ip` (`device_ip`);

-- ============================================================
-- Salaries (points to users.user_id)
-- ============================================================
CREATE TABLE IF NOT EXISTS `salaries` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'يشير إلى users.user_id',
  `year` year(4) NOT NULL,
  `salary` decimal(15,2) NOT NULL DEFAULT '0.00',
  `salary_currency` varchar(50) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `salaries_user_id_year_index` (`user_id`,`year`),
  KEY `salaries_year_index` (`year`),
  KEY `salaries_is_default_index` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fix FK to users.user_id
SET @fk := (
  SELECT CONSTRAINT_NAME
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'salaries'
    AND COLUMN_NAME = 'user_id'
    AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);
SET @sql := IF(@fk IS NOT NULL,
  CONCAT('ALTER TABLE `salaries` DROP FOREIGN KEY `', @fk, '`;'),
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE `salaries`
  ADD CONSTRAINT `fk_salaries_user`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE;

-- ============================================================
-- Settings key/value
-- ============================================================
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `key` varchar(191) NOT NULL,
  `display_name` varchar(191) DEFAULT NULL,
  `value` text DEFAULT NULL,
  `details` text DEFAULT NULL,
  `type` varchar(191) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 1,
  `group` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Debts
-- ============================================================
CREATE TABLE IF NOT EXISTS `debts` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT 0,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `debts_user_id_index` (`user_id`),
  CONSTRAINT `debts_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `alerts_user_id_index` (`user_id`),
  CONSTRAINT `alerts_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Attendance records (aggregate)
-- ============================================================
CREATE TABLE IF NOT EXISTS `attendancerecords` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `netPeriod` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attendancerecords_user_date_idx` (`user_id`,`date`),
  CONSTRAINT `attendancerecords_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Categories (Voyager-like)
-- ============================================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order` int(11) DEFAULT 0,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categories_parent_id_idx` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Membership types
-- ============================================================
CREATE TABLE IF NOT EXISTS `membershiptypes` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Committees
-- ============================================================
CREATE TABLE IF NOT EXISTS `committees` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Committee members (pivot)
CREATE TABLE IF NOT EXISTS `committees_members` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `committee_id` bigint(20) UNSIGNED NOT NULL,
  `member_id` bigint(20) UNSIGNED NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `committees_members_committees_idx` (`committee_id`),
  KEY `committees_members_members_idx` (`member_id`),
  CONSTRAINT `committees_members_committee_fk` FOREIGN KEY (`committee_id`) REFERENCES `committees`(`id`) ON DELETE CASCADE,
  CONSTRAINT `committees_members_member_fk` FOREIGN KEY (`member_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Members (generic directory)
-- ============================================================
CREATE TABLE IF NOT EXISTS `members` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `members_user_idx` (`user_id`),
  CONSTRAINT `members_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Posts (basic CMS)
-- ============================================================
CREATE TABLE IF NOT EXISTS `posts` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `urlTitle` varchar(255) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `isFeatured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `posts_category_idx` (`category_id`),
  CONSTRAINT `posts_category_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Speakers (for events)
-- ============================================================
CREATE TABLE IF NOT EXISTS `speakers` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event-speaker pivot
CREATE TABLE IF NOT EXISTS `events_speakers` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `speaker_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `events_speakers_event_idx` (`event_id`),
  KEY `events_speakers_speaker_idx` (`speaker_id`),
  CONSTRAINT `events_speakers_event_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  CONSTRAINT `events_speakers_speaker_fk` FOREIGN KEY (`speaker_id`) REFERENCES `speakers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Final verification queries (optional)
-- ============================================================
-- SHOW TABLES;
-- SHOW CREATE TABLE leave_transfers\G
-- SHOW CREATE TABLE vacations_users\G
-- SHOW CREATE TABLE events\G
-- SHOW CREATE TABLE salaries\G

SELECT 'Database setup completed (idempotent).' AS status;

