-- ============================================================
-- Full database setup / sync script
-- MySQL 8+
-- Safe to run multiple times
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USERS (PK = user_id)
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `is_hidden` TINYINT(1) NOT NULL DEFAULT 0,
  `status` VARCHAR(8) DEFAULT NULL,
  `remember_token` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VACATION TYPES
-- ============================================================

CREATE TABLE IF NOT EXISTS `vacationstypes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `is_yearly` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VACATIONS (Requests)
-- ============================================================

CREATE TABLE IF NOT EXISTS `vacations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `vacationstype_id` BIGINT UNSIGNED NOT NULL,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `status` VARCHAR(32) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vacations_user` (`user_id`),
  KEY `idx_vacations_type` (`vacationstype_id`),
  CONSTRAINT `fk_vacations_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vacations_type`
    FOREIGN KEY (`vacationstype_id`) REFERENCES `vacationstypes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- VACATIONS BALANCE
-- ============================================================

CREATE TABLE IF NOT EXISTS `vacations_users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `vacationstype_id` BIGINT UNSIGNED NOT NULL,
  `amount` INT NOT NULL DEFAULT 0 COMMENT 'بالدقائق',
  `period_type` ENUM('monthly','yearly') DEFAULT 'monthly',
  `transfer_from_year` YEAR NULL,
  `type` INT UNSIGNED NULL COMMENT '34=مرحل,35=حالي,36=محول',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vac_users_user_type` (`user_id`,`vacationstype_id`),
  KEY `idx_vac_users_period` (`period_type`),
  KEY `idx_vac_users_transfer_year` (`transfer_from_year`),
  CONSTRAINT `fk_vac_users_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_vac_users_type`
    FOREIGN KEY (`vacationstype_id`) REFERENCES `vacationstypes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- LEAVE TRANSFERS
-- ============================================================

CREATE TABLE IF NOT EXISTS `leave_transfers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `vacationstype_id` BIGINT UNSIGNED NOT NULL,
  `amount` INT NOT NULL,
  `from_year` YEAR NOT NULL,
  `to_year` YEAR NOT NULL,
  `transfer_date` DATETIME NOT NULL,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_leave_user` (`user_id`),
  KEY `idx_leave_type` (`vacationstype_id`),
  KEY `idx_leave_date` (`transfer_date`),
  CONSTRAINT `fk_leave_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_leave_type`
    FOREIGN KEY (`vacationstype_id`) REFERENCES `vacationstypes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_leave_creator`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS `events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `events_datetime` DATETIME NOT NULL,
  `device_id` INT DEFAULT NULL,
  `device_ip` VARCHAR(45) DEFAULT NULL,
  `device_name` VARCHAR(255) DEFAULT NULL,
  `event_type` INT DEFAULT NULL COMMENT '0=In,1=Out',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_user_datetime` (`user_id`,`events_datetime`),
  KEY `idx_events_device_id` (`device_id`),
  KEY `idx_events_device_ip` (`device_ip`),
  CONSTRAINT `fk_events_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SALARIES
-- ============================================================

CREATE TABLE IF NOT EXISTS `salaries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `year` YEAR NOT NULL,
  `salary` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `salary_currency` VARCHAR(50) DEFAULT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_salary_user_year` (`user_id`,`year`),
  CONSTRAINT `fk_salary_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- FINAL
-- ============================================================

SELECT 'Database setup completed successfully' AS status;
